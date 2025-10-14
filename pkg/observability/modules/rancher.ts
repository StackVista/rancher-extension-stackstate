import {
  OBSERVABILITY_CLUSTERREPO,
  OBSERVABILITY_CONFIGURATION_TYPE,
} from "../types/types";
import { logger } from "../utils/logger";
import { ObservabilitySettings } from "./settings";

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
      migrated: false,
    };
  } else {
    return undefined;
  }
}

export async function saveSuseObservabilitySettings(
  store: any,
  settings: ObservabilitySettings,
): Promise<void> {
  const saved = await store.dispatch("management/findAll", {
    type: OBSERVABILITY_CONFIGURATION_TYPE,
  });
  const record = saved?.find(isSuseObservabilitySettings);

  let newConfig;
  if (!record) {
    const config = {
      metadata: { name: `suse-observability`, namespace: "default" },
      spec: {},
      type: OBSERVABILITY_CONFIGURATION_TYPE,
    };

    newConfig = await store.dispatch("management/create", config);
  } else {
    const configs = await store.dispatch("management/findAll", {
      type: OBSERVABILITY_CONFIGURATION_TYPE,
    });
    newConfig = configs[0];
  }

  newConfig.apiVersion = "observability.rancher.io/v1";
  newConfig.spec.url = settings.url;
  newConfig.spec.serviceToken = settings.serviceToken;
  newConfig.save();
}

/**
 * Check if the CRD is loaded
 */
export function isCrdLoaded(store: any): boolean {
  const loaded = store.getters["management/schemaFor"](
    OBSERVABILITY_CONFIGURATION_TYPE,
  );

  return loaded?.attributes.version == "v1";
}

export async function isSuseObservabilityRepoPresent(
  store: any,
): Promise<boolean> {
  logger.log("Checking if Observability Repo is present");

  const repos: undefined | ReadonlyArray<any> = await store.dispatch(
    "management/findAll",
    { type: "catalog.cattle.io.clusterrepo" },
  );

  logger.log("Checking if Observability Repo is present", repos);

  const isPresent = repos?.some(isSuseObservabilitySettings) ?? false;

  logger.log("Checking if Observability Repo is present", isPresent);

  return isPresent;
}

export async function createObservabilityRepoIfNotPresent(store: any) {
  logger.log("Creating Observability Repo if needed");
  const isRepoPresent = await isSuseObservabilityRepoPresent(store);
  if (!isRepoPresent) {
    logger.log("Creating Observability Repo");
    await store.dispatch("management/request", {
      url: "/v1/catalog.cattle.io.clusterrepos",
      method: "POST",
      data: OBSERVABILITY_CLUSTERREPO,
    });
    logger.log("Created Observability Repo");
  }
}

export async function loadConnectionInfo(store: any): Promise<void> {
  const suseObservabilitySettings = await loadSuseObservabilitySettings(store);

  if (suseObservabilitySettings) {
    await store.dispatch("observability/setConnectionInfo", {
      apiURL: suseObservabilitySettings.url,
      serviceToken: suseObservabilitySettings.serviceToken,
    });
  }
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
