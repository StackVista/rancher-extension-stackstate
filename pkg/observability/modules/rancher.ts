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
    if (configmaps.length > 0) {
      const clusterNames = configmaps.flatMap((depl: any) =>
        depl.data && "STS_CLUSTER_NAME" in depl.data
          ? [depl.data["STS_CLUSTER_NAME"]]
          : [],
      );
      return {
        status: AgentStatus.Installed,
        clusterName: clusterNames?.[0],
      };
    } else {
      const deployResponse = await store.dispatch(`cluster/request`, {
        url: `/k8s/clusters/${clusterId}/v1/apps.deployments`,
      });
      const deployments = deployResponse?.data?.filter(
        (depl: any) =>
          depl.metadata?.labels &&
          depl.metadata.labels["app.kubernetes.io/name"] ===
            "suse-observability-agent",
      );
      return {
        status:
          deployments.length > 0
            ? AgentStatus.Installed
            : AgentStatus.NotInstalled,
      };
    }
  } catch (e) {
    return {
      status: AgentStatus.ConnectionError,
    };
  }
}
