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

export function buildUrn(
  component: any,
  clusterName: string | undefined,
): string | undefined {
  if (!component.type) {
    return undefined;
  }

  const kind = mapKind(component.type.toLowerCase());

  if (!clusterName) {
    throw new Error(`Cluster name is required for ${kind} URN`);
  }

  const namespace = component.metadata?.namespace;
  const name = component.metadata?.name || component.name;

  switch (kind) {
    case STS_CLUSTER:
      return `urn:cluster:/${clusterName}`;
    case STS_NODE:
      return `urn:kubernetes:/${clusterName}:node/${name}`;
    case STS_NAMESPACE:
      return `urn:kubernetes:/${clusterName}:namespace/${name}`;
    default:
      return `urn:kubernetes:/${clusterName}:${namespace}:${kind}/${name}`;
  }
}
