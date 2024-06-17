import { isEmpty } from 'lodash';
import { ComponentType, ConnectionInfo } from 'types/component';
import {
  CONFIG_MAP, NAMESPACE, NODE, POD, SECRET, SERVICE, WORKLOAD_TYPES
} from '@shell/config/types';
import { CLUSTER } from '@shell/store/prefs';

// Map of kinds to their display names
const KINDS = new Map<string, string>([
  [POD, 'pod'],
  [SERVICE, 'service'],
  [NODE, 'node'],
  [WORKLOAD_TYPES.DAEMON_SET, 'daemonset'],
  [WORKLOAD_TYPES.DEPLOYMENT, 'deployment'],
  [WORKLOAD_TYPES.STATEFUL_SET, 'statefulset'],
  [WORKLOAD_TYPES.CRON_JOB, 'cron-job'],
  [WORKLOAD_TYPES.JOB, 'job'],
  [WORKLOAD_TYPES.REPLICA_SET, 'replicaset'],
  [WORKLOAD_TYPES.REPLICATION_CONTROLLER, 'replication-controller'],
  [CLUSTER, 'cluster'],
  [CONFIG_MAP, 'configmap'],
  [SECRET, 'secret'],
  [NAMESPACE, 'namespace'],
]);

export function mapKind(kind: string): string {
  return KINDS.get(kind) || kind;
}

export async function loadStackStateSettings(store: any) {
  console.log('Loading StackState settings');
  const settings = await store.dispatch('management/findAll', { type: 'stackstate.io.setting' });

  if (isEmpty(settings)) {
    return;
  }

  const stackstateSettings = settings.find((s: any) => s.metadata.name === 'stackstate');

  if (isEmpty(stackstateSettings)) {
    return;
  }
  console.log('Has stackstate settings', stackstateSettings.spec.url, stackstateSettings.spec.apiToken, stackstateSettings.spec.serviceToken);

  return stackstateSettings;
}

export async function loadConnectionInfo(store: any): Promise<void> {
  console.log('Loading StackState connection info');
  const settings = await store.dispatch('management/findAll', { type: 'stackstate.io.setting' });

  console.log('settings', settings);
  if (isEmpty(settings)) {
    return;
  }
  console.log('Has settings');
  const stackstateSettings = settings.find((s: any) => s.metadata.name === 'stackstate');

  if (isEmpty(stackstateSettings)) {
    return;
  }
  console.log('Has stackstate settings', stackstateSettings.spec.url, stackstateSettings.spec.apiToken, stackstateSettings.spec.serviceToken);
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
