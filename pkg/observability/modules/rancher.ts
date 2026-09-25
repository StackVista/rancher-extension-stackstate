import { SECRET } from "@shell/config/types";
import { ObservabilitySettings } from "./settings";

const EXTENSION_NAMESPACE = "suse-observability-extension";
const CONFIGURATION_NAME = "configuration";

export async function loadSuseObservabilitySettings(
  store: any,
): Promise<undefined | ObservabilitySettings> {
  try {
    const secret = await store.dispatch("management/find", {
      type: SECRET,
      id: `${EXTENSION_NAMESPACE}/${CONFIGURATION_NAME}`,
    });
    return secret.data?.url && secret.data?.serviceToken
      ? {
          url: secret.data?.url ? atob(secret.data.url) : "",
          serviceToken: secret.data?.serviceToken
            ? atob(secret.data.serviceToken)
            : "",
          migrated: false,
        }
      : undefined;
  } catch (e: any) {
    // fall through if configuration doesn't exist yet - bail out otherwise
    if (e?.status !== 404) {
      return undefined;
    }
  }

  return undefined;
}

export async function saveSuseObservabilitySettings(
  store: any,
  settings: ObservabilitySettings,
): Promise<void> {
  let secret;
  try {
    secret = await store.dispatch("management/find", {
      type: SECRET,
      id: `${EXTENSION_NAMESPACE}/${CONFIGURATION_NAME}`,
    });
  } catch (e) {
    const config = {
      metadata: { namespace: EXTENSION_NAMESPACE, name: CONFIGURATION_NAME },
      type: SECRET,
    };
    secret = await store.dispatch("management/create", config);
  }

  secret.data = {
    url: btoa(settings.url),
    serviceToken: btoa(settings.serviceToken),
  };
  await secret.save();
}

export enum AgentStatus {
  Installed = 0,
  NotInstalled,
  ConnectionError,
}

export interface ObservabilityAgent {
  status: AgentStatus;
  clusterName?: string;
}

export async function loadAgentStatus(
  store: any,
  clusterId: string,
): Promise<ObservabilityAgent> {
  let installed = false;
  let configMapLookupFailed = false;

  try {
    const response = await store.dispatch(`cluster/request`, {
      url: `/k8s/clusters/${clusterId}/v1/configmaps`,
    });
    const configmaps = response?.data?.filter(
      (depl: any) =>
        depl.metadata?.labels &&
        depl.metadata.labels["app.kubernetes.io/component"] ===
          "suse-observability-agent" &&
        depl.metadata?.name?.endsWith("-cluster-name"),
    );
    installed = configmaps.length > 0;
    const clusterName = configmaps
      .map((configmap: any) => configmap.data?.STS_CLUSTER_NAME)
      .find(
        (name: unknown) => typeof name === "string" && name.trim().length > 0,
      );

    if (clusterName) {
      return {
        status: AgentStatus.Installed,
        clusterName,
      };
    }
  } catch {
    configMapLookupFailed = true;
  }

  try {
    const deployResponse = await store.dispatch(`cluster/request`, {
      url: `/k8s/clusters/${clusterId}/v1/apps.deployments`,
    });
    const deployments = deployResponse?.data?.filter(
      (depl: any) =>
        depl.metadata?.labels &&
        depl.metadata.labels["app.kubernetes.io/name"] ===
          "suse-observability-agent",
    );
    installed = deployments.length > 0 || installed;
    const clusterName = await loadClusterNameFromSecret(
      store,
      clusterId,
      deployments,
    );

    if (clusterName) {
      return { status: AgentStatus.Installed, clusterName };
    }

    if (!installed && configMapLookupFailed) {
      return { status: AgentStatus.ConnectionError };
    }

    return {
      status: installed ? AgentStatus.Installed : AgentStatus.NotInstalled,
    };
  } catch (e) {
    return {
      status: installed ? AgentStatus.Installed : AgentStatus.ConnectionError,
    };
  }
}

async function loadClusterNameFromSecret(
  store: any,
  clusterId: string,
  deployments: any[],
): Promise<string | undefined> {
  const visited = new Set<string>();

  for (const deployment of deployments) {
    const namespace = deployment.metadata?.namespace;
    if (!namespace) {
      continue;
    }

    for (const container of deployment.spec?.template?.spec?.containers ?? []) {
      for (const variable of container.env ?? []) {
        if (
          variable.name !== "STS_CLUSTER_NAME" &&
          variable.name !== "K8S_CLUSTER_NAME"
        ) {
          continue;
        }

        const reference = variable.valueFrom?.secretKeyRef;
        if (!reference?.name || !reference.key) {
          continue;
        }

        const referenceId = `${namespace}/${reference.name}/${reference.key}`;
        if (visited.has(referenceId)) {
          continue;
        }
        visited.add(referenceId);

        try {
          const secret = await store.dispatch("cluster/request", {
            url: `/k8s/clusters/${clusterId}/v1/secrets/${encodeURIComponent(namespace)}/${encodeURIComponent(reference.name)}`,
          });
          const encodedName = secret?.data?.[reference.key];
          if (typeof encodedName !== "string") {
            continue;
          }

          const clusterName = atob(encodedName);
          if (clusterName.trim()) {
            return clusterName;
          }
        } catch {}
      }
    }
  }

  return undefined;
}
