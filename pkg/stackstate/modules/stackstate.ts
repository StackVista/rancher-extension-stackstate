import { isEmpty } from 'lodash';
import { ComponentType, ConnectionInfo } from 'types/component';
import {
  CONFIG_MAP, NAMESPACE, NODE, POD, SECRET, SERVICE, WORKLOAD_TYPES
} from '@shell/config/types';
import { CLUSTER } from '@shell/store/prefs';

export const STS_POD = 'pod';
export const STS_SERVICE = 'service';
export const STS_NODE = 'node';
export const STS_DAEMON_SET = 'daemonset';
export const STS_DEPLOYMENT = 'deployment';
export const STS_STATEFUL_SET = 'statefulset';
export const STS_CRON_JOB = 'cronjob';
export const STS_JOB = 'job';
export const STS_REPLICA_SET = 'replicaset';
export const STS_REPLICATION_CONTROLLER = 'replication-controller';
export const STS_CLUSTER = 'cluster';
export const STS_CONFIG_MAP = 'configmap';
export const STS_SECRET = 'secret';
export const STS_NAMESPACE = 'namespace';

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

export async function loadStackStateSettings(store: any) {
  const settings = await store.dispatch('management/findAll', { type: 'stackstate.io.setting' });

  if (isEmpty(settings)) {
    return;
  }

  const stackstateSettings = settings.find((s: any) => s.metadata.name === 'stackstate');

  if (isEmpty(stackstateSettings)) {
    return;
  }

  return stackstateSettings;
}

export async function loadConnectionInfo(store: any): Promise<void> {
  const settings = await store.dispatch('management/findAll', { type: 'stackstate.io.setting' });

  if (isEmpty(settings)) {
    return;
  }
  const stackstateSettings = settings.find((s: any) => s.metadata.name === 'stackstate');

  if (isEmpty(stackstateSettings)) {
    return;
  }
  store.dispatch('stackstate/setConnectionInfo', {
    apiURL: stackstateSettings.spec.url, apiToken: stackstateSettings.spec.apiToken, serviceToken: stackstateSettings.spec.serviceToken
  });

  return stackstateSettings;
}

export async function loadComponentTypes(store: any): Promise<ComponentType[] | void> {
  const stackStateURL = await store.getters['stackstate/apiURL'];
  const apiToken = await store.getters['stackstate/apiToken'];
  const serviceToken = await store.getters['stackstate/serviceToken'];

  if (!stackStateURL || (!apiToken && !serviceToken)) {
    return;
  }

  const creds = token(apiToken, serviceToken);

  const allComponentTypes = await store.dispatch(`management/request`, {
    url:     `meta/proxy/${ stackStateURL }/api/node/ComponentType`,
    method:  'GET',
    headers: { 'Content-Type': 'application/json', 'X-API-Auth-Header': creds },
  });

  if (isEmpty(allComponentTypes)) {
    return;
  }

  for (const ct of allComponentTypes) {
    store.dispatch('stackstate/addComponentType', { id: ct.id, name: ct.name });
  }

  return allComponentTypes;
}

export async function getSnapshot(store: any, stql: string, creds: any | undefined): Promise<any | void> {
  const stackStateURL = creds ? creds.spec.url : await store.getters['stackstate/apiURL'];
  const apiToken = creds ? creds.spec.apiToken : await store.getters['stackstate/apiToken'];
  const serviceToken = creds ? creds.spec.serviceToken : await store.getters['stackstate/serviceToken'];

  if (!stackStateURL || (!apiToken && !serviceToken)) {
    return;
  }

  const httpToken = token(apiToken, serviceToken);

  return store.dispatch('management/request', {
    url:     `meta/proxy/${ stackStateURL }/api/snapshot`,
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Auth-Header': httpToken },
    data:    {
      query:        stql,
      queryVersion: '1.0',
      metadata:     {
        groupingEnabled:       false,
        showIndirectRelations: false,
        minGroupSize:          10,
        groupedByLayer:        false,
        groupedByDomain:       false,
        groupedByRelation:     false,
        autoGrouping:          false,
        connectedComponents:   false,
        neighboringComponents: false
      }
    },
  });
}

export function loadComponent(store: any, credentials: any, identifier: string) {
  const creds = token(credentials.spec.apiToken, credentials.spec.serviceToken);

  return store.dispatch('management/request', {
    url:     `meta/proxy/${ credentials.spec.url }/api/components?identifier=${ encodeURIComponent(identifier) }`,
    method:  'GET',
    headers: { 'Content-Type': 'application/json', 'X-API-Auth-Header': creds },
  });
}

function token(apiToken: string, serviceToken: string): string {
  return apiToken ? `ApiToken ${ apiToken }` : `ApiKey ${ serviceToken }`;
}
