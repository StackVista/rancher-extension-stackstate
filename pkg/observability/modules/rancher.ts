import { SECRET } from "@shell/config/types";
import { OBSERVABILITY_CONFIGURATION_TYPE } from "../types/types";
import { ObservabilitySettings } from "./settings";

const EXTENSION_NAMESPACE = "suse-observability-extension";
const CONFIGURATION_NAME = "configuration";

function isSuseObservabilityName(name: string): boolean {
  // match either the legacy (stackstate) or new (suse-observability) name
  return name === "stackstate" || name === "suse-observability";
}

function isSuseObservabilitySettings(settings: any): boolean {
  return isSuseObservabilityName(settings.metadata.name);
}

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

  // legacy: used a CR(D) to define and store configuration

  try {
    const settings = await store.dispatch("management/findAll", {
      type: OBSERVABILITY_CONFIGURATION_TYPE,
    });
    const record = settings?.find(isSuseObservabilitySettings);

    if (record?.apiVersion == "observability.rancher.io/v1beta1") {
      return {
        url: `https://${record.spec.url}`,
        serviceToken: record.spec.serviceToken,
        migrated: true,
      };
    } else if (record) {
      return {
        url: record.spec.url,
        serviceToken: record.spec.serviceToken,
        migrated: true,
      };
    } else {
      return undefined;
    }
  } catch (e) {
    // CRD - based configuration not available
    return undefined;
  }
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

export async function deleteCustomResources(store: any) {
  const saved: Array<any> = await store.dispatch("management/findAll", {
    type: OBSERVABILITY_CONFIGURATION_TYPE,
  });

  await Promise.all(
    saved.map(async (config) => {
      await config.remove();
    }),
  );

  await store.dispatch("management/request", {
    url: "/v1/apiextensions.k8s.io.customresourcedefinitions/configurations.observability.rancher.io",
    method: "DELETE",
  });
}

/**
 * Check if the CRD is loaded
 */
export function isCrdLoaded(store: any): boolean {
  const loaded = store.getters["management/schemaFor"](
    OBSERVABILITY_CONFIGURATION_TYPE,
  );
  return loaded !== undefined;
}

export enum AgentStatus {
  Installed = 0,
  NotInstalled,
  ConnectionError,
}

export async function loadAgentStatus(
  store: any,
  clusterId: string,
): Promise<AgentStatus> {
  try {
    const response = await store.dispatch(`cluster/request`, {
      url: `/k8s/clusters/${clusterId}/v1/apps.deployments`,
    });
    const deployments = response?.data?.filter(
      (depl: any) =>
        depl.metadata?.labels &&
        (depl.metadata.labels["app.kubernetes.io/name"] ===
          "suse-observability-agent" ||
          // backwards compatibility
          depl.metadata.labels["app.kubernetes.io/name"] ===
            "stackstate-k8s-agent"),
    );

    return deployments.length > 0
      ? AgentStatus.Installed
      : AgentStatus.NotInstalled;
  } catch (e) {
    return AgentStatus.ConnectionError;
  }
}

export async function findNodeDrivers(store: any): Promise<Array<any>> {
  const nodeDrivers = await store.dispatch(
    "rancher/findAll",
    { type: "nodeDriver" },
    { root: true },
  );
  return nodeDrivers.filter(
    (driver: any) => driver.name === "suse-observability",
  );
}
