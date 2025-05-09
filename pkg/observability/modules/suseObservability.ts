import { ConnectionInfo } from 'types/component';
import {
  CONFIG_MAP, MANAGEMENT,
  NAMESPACE,
  NODE,
  POD,
  SECRET,
  SERVICE,
  WORKLOAD_TYPES,
} from '@shell/config/types';
import { CLUSTER } from '@shell/store/prefs';
//import RoleTemplate from '@shell/models/management.cattle.io.roletemplate';
import { OBSERVABILITY_CLUSTERREPO, OBSERVABILITY_CONFIGURATION_TYPE } from '../types/types';
import { logger } from '../utils/logger';

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

export interface ObservabilitySettings {
  spec: {
    url: string;
    apiToken: string;
    serviceToken: string;
  }
  metadata: Record<string, string>;
}

export interface RoleTemplate {
  id: string;
}

function isSuseObservabilityName(name: string): boolean {
  // match either the legacy (stackstate) or new (suse-observability) name
  return name === 'stackstate' || name === 'suse-observability';
}

function isSuseObservabilitySettings(settings: ObservabilitySettings): boolean {
  return isSuseObservabilityName(settings.metadata.name);
}

export async function loadRoleTemplates(store: any): Promise<undefined | ReadonlyArray<RoleTemplate>> {
  return await store.dispatch(
    'management/findAll',
    { type: MANAGEMENT.ROLE_TEMPLATE }
  );
}

export async function loadSuseObservabilitySettings(store: any): Promise<undefined | ObservabilitySettings> {
  const settings: undefined | ReadonlyArray<ObservabilitySettings> = await store.dispatch('management/findAll', { type: OBSERVABILITY_CONFIGURATION_TYPE });

  return settings?.find(isSuseObservabilitySettings);
}

/**
 * Check if the CRD is loaded
 */
export function isCrdLoaded(store: any): boolean {
  const loaded = store.getters['management/schemaFor'](
    OBSERVABILITY_CONFIGURATION_TYPE
  );

  return loaded;
}

export async function isSuseObservabilityRepoPresent(store: any): Promise<boolean> {
  logger.log('Checking if Observability Repo is present');

  const repos: undefined | ReadonlyArray<ObservabilitySettings> = await store.dispatch('management/findAll', { type: 'catalog.cattle.io.clusterrepo' });

  logger.log('Checking if Observability Repo is present', repos);

  const isPresent = repos?.some(isSuseObservabilitySettings) ?? false;

  logger.log('Checking if Observability Repo is present', isPresent);

  return isPresent;
}

export async function createObservabilityRepoIfNotPresent(store: any) {
  logger.log('Creating Observability Repo if needed');
  if (!(await isSuseObservabilityRepoPresent(store))) {
    logger.log('Creating Observability Repo');
    await store.dispatch('management/request', {
      url:    '/v1/catalog.cattle.io.clusterrepos',
      method: 'POST',
      data:   OBSERVABILITY_CLUSTERREPO,
    });
    logger.log('Created Observability Repo');
  }
}

export async function loadConnectionInfo(store: any): Promise<void> {
  const settings: undefined | ReadonlyArray<ObservabilitySettings> = await store.dispatch('management/findAll', { type: OBSERVABILITY_CONFIGURATION_TYPE });

  const suseObservabilitySettings = settings?.find(isSuseObservabilitySettings);

  if (suseObservabilitySettings) {
    await store.dispatch('observability/setConnectionInfo', {
      apiURL:       suseObservabilitySettings.spec.url,
      apiToken:     suseObservabilitySettings.spec.apiToken,
      serviceToken: suseObservabilitySettings.spec.serviceToken,
    });
  }
}

/**
 * Check whether the connection credentials are valid.
 * @param store The Vue Store
 * @param credentials The Credentials to validate.
 * @returns
 */
export async function checkConnection(
  store: any,
  credentials: ConnectionInfo
): Promise<boolean> {
  const creds = token(credentials.apiToken, credentials.serviceToken);

  try {
    const resp = await store.dispatch('management/request', {
      url:     `meta/proxy/${ credentials.apiURL }/api/server/info`,
      method:  'GET',
      headers: {
        'Content-Type':      'application/json',
        'X-API-Auth-Header': creds,
      },
      redirectUnauthorized: false,
    });

    if (resp._status !== 200) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

export async function getSnapshot(
  store: any,
  stql: string,
  settings: undefined | ObservabilitySettings
): Promise<any | void> {
  const suseObservabilityURL = settings ? settings.spec.url : await store.getters['observability/apiURL'];
  const apiToken = settings ? settings.spec.apiToken : await store.getters['observability/apiToken'];
  const serviceToken = settings ? settings.spec.serviceToken : await store.getters['observability/serviceToken'];

  if (!suseObservabilityURL || (!apiToken && !serviceToken)) {
    return;
  }

  const httpToken = token(apiToken, serviceToken);

  return store.dispatch('management/request', {
    url:     `meta/proxy/${ suseObservabilityURL }/api/snapshot`,
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'X-API-Auth-Header': httpToken,
    },
    data: {
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
        neighboringComponents: false,
        showFullComponent:     false,
      },
    },
  });
}

export function loadComponent(
  store: any,
  { spec }: ObservabilitySettings,
  identifier: string
) {
  const creds = token(spec.apiToken, spec.serviceToken);

  return store.dispatch('management/request', {
    url:     `meta/proxy/${ spec.url }/api/components?identifier=${ encodeURIComponent(identifier) }`,
    method:  'GET',
    headers: { 'Content-Type': 'application/json', 'X-API-Auth-Header': creds },
  });
}

function token(apiToken: string, serviceToken: string): string {
  return apiToken ? `ApiToken ${ apiToken }` : `ApiKey ${ serviceToken }`;
}

/**
 * Ensure that there is a NodeDriver called 'suse-observability' (previously 'stackstate') that has the URL whitelisted, so that the
 * Metadata Proxy can call out to the SUSE Observability API.
 *
 * NOTE: Be aware that this goes through Norman APIs, not the Steve ones.
 *
 * @param store
 * @param url
 * @returns
 */
export async function ensureObservabilityUrlWhitelisted(
  store: any,
  url: string
): Promise<boolean> {
  async function newNodeDriver(store: any): Promise<any> {
    const emptyDriver = {
      name: `suse-observability`,
      type: 'nodeDriver',
    };

    return await store.dispatch('rancher/create', emptyDriver);
  }

  const nodeDrivers = await store.dispatch(
    'rancher/findAll',
    { type: 'nodeDriver' },
    { root: true }
  );

  const suseObservabilityDriver =
    nodeDrivers.find((driver: any) => isSuseObservabilityName(driver.name) ) ||
    (await newNodeDriver(store));

  if (!suseObservabilityDriver.whitelistDomains) {
    suseObservabilityDriver.whitelistDomains = [];
  }

  // Already in the whitelist
  if (
    suseObservabilityDriver.whitelistDomains.find((domain: string) => domain === url)
  ) {
    return true;
  }

  suseObservabilityDriver.state = 'inactive';
  suseObservabilityDriver.url = 'local://';
  suseObservabilityDriver.whitelistDomains.push(url);

  try {
    await suseObservabilityDriver.save();

    return true;
  } catch (e) {
    return false;
  }
}
