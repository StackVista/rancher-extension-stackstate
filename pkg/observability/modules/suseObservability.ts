import { ConnectionInfo } from "types/component";
import {
  CONFIG_MAP,
  NAMESPACE,
  NODE,
  POD,
  SECRET,
  SERVICE,
  WORKLOAD_TYPES,
} from "@shell/config/types";
import { CLUSTER } from "@shell/store/prefs";
import {
  OBSERVABILITY_CLUSTERREPO,
  OBSERVABILITY_CONFIGURATION_TYPE,
} from "../types/types";
import { logger } from "../utils/logger";

export const STS_POD = "pod";
export const STS_SERVICE = "service";
export const STS_NODE = "node";
export const STS_DAEMON_SET = "daemonset";
export const STS_DEPLOYMENT = "deployment";
export const STS_STATEFUL_SET = "statefulset";
export const STS_CRON_JOB = "cronjob";
export const STS_JOB = "job";
export const STS_REPLICA_SET = "replicaset";
export const STS_REPLICATION_CONTROLLER = "replication-controller";
export const STS_CLUSTER = "cluster";
export const STS_CONFIG_MAP = "configmap";
export const STS_SECRET = "secret";
export const STS_NAMESPACE = "namespace";

// Map of kinds to their display names
const KINDS = new Map<string, string>([
  [POD, STS_POD],
  [SERVICE, STS_SERVICE],
  [NODE, STS_NODE],
  [WORKLOAD_TYPES.DAEMON_SET, STS_DAEMON_SET],
  [WORKLOAD_TYPES.DEPLOYMENT, STS_DEPLOYMENT],
  [WORKLOAD_TYPES.STATEFUL_SET, STS_STATEFUL_SET],
  [WORKLOAD_TYPES.CRON_JOB, STS_CRON_JOB],
  [WORKLOAD_TYPES.JOB, STS_JOB],
  [WORKLOAD_TYPES.REPLICA_SET, STS_REPLICA_SET],
  [WORKLOAD_TYPES.REPLICATION_CONTROLLER, STS_REPLICATION_CONTROLLER],
  [CLUSTER, STS_CLUSTER],
  [CONFIG_MAP, STS_CONFIG_MAP],
  [SECRET, STS_SECRET],
  [NAMESPACE, STS_NAMESPACE],
]);

export function mapKind(kind: string): string {
  return KINDS.get(kind) || kind;
}

export interface ObservabilitySettings {
  url: string;
  serviceToken: string;
}

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
    };
  } else if (record) {
    return {
      url: record.spec.url,
      serviceToken: record.spec.serviceToken,
    };
  } else {
    return undefined;
  }
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
  if (!(await isSuseObservabilityRepoPresent(store))) {
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

/**
 * Check whether the connection credentials are valid.
 * @param store The Vue Store
 * @param credentials The Credentials to validate.
 * @returns
 */
export enum ConnectionStatus {
  Connected = 0,
  InvalidToken,
  CrossOriginError,
}

export async function checkConnection(
  store: any,
  credentials: ConnectionInfo,
): Promise<ConnectionStatus> {
  const creds = token(credentials.serviceToken);

  try {
    const resp = await store.dispatch("management/request", {
      url: `${credentials.apiURL}/api/server/info`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: creds,
      },
      redirectUnauthorized: false,
    });

    if (resp._status !== 200) {
      return ConnectionStatus.InvalidToken;
    }

    return ConnectionStatus.Connected;
  } catch (e) {
    if (e instanceof Error) {
      return ConnectionStatus.CrossOriginError;
    } else {
      return ConnectionStatus.InvalidToken;
    }
  }
}

export enum ObservationStatus {
  Observed = 0,
  NotDeployed,
  ConnectionError,
}

export async function loadObservationStatus(
  store: any,
  clusterName: string,
  settings: ObservabilitySettings,
): Promise<ObservationStatus> {
  try {
    const clusterUrn = `urn:cluster:/kubernetes:${clusterName}`;
    await loadComponent(store, settings, clusterUrn);
    return ObservationStatus.Observed;
  } catch (e) {
    if (e instanceof Error) {
      return ObservationStatus.ConnectionError;
    } else {
      return ObservationStatus.NotDeployed;
    }
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

export async function getSnapshot(
  store: any,
  stql: string,
  settings: ObservabilitySettings,
): Promise<any | void> {
  const suseObservabilityURL = settings.url;
  const serviceToken = settings.serviceToken;

  if (!suseObservabilityURL || !serviceToken) {
    return;
  }

  const httpToken = token(serviceToken);

  return await store.dispatch("management/request", {
    url: `${suseObservabilityURL}/api/snapshot`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: httpToken,
    },
    withCredentials: true,
    data: {
      query: stql,
      queryVersion: "1.0",
      metadata: {
        groupingEnabled: false,
        showIndirectRelations: false,
        minGroupSize: 10,
        groupedByLayer: false,
        groupedByDomain: false,
        groupedByRelation: false,
        autoGrouping: false,
        connectedComponents: false,
        neighboringComponents: false,
        showFullComponent: false,
      },
    },
  });
}

export function loadComponent(
  store: any,
  spec: ObservabilitySettings,
  identifier: string,
) {
  const creds = token(spec.serviceToken);

  return store.dispatch("management/request", {
    url: `${spec.url}/api/components?identifier=${encodeURIComponent(identifier)}`,
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: creds },
  });
}

function token(serviceToken: string): string {
  return `ApiKey ${serviceToken}`;
}
