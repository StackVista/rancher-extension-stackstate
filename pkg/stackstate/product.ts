import { HeaderOptions, IPlugin, TableColumnLocation } from '@rancher/shell/core/types';
import { NODE, POD, SERVICE, WORKLOAD_TYPES } from '@shell/config/types';
import { StackStateHealth } from './types/headers';
import { STACKSTATE_CLUSTER } from './types/stackstate.io.cluster';
import { STACKSTATE_SETTINGS } from './types/stackstate.io.settings';
import {
  STACKSTATE_NAME,
  STACKSTATE_PRODUCT_NAME,
  STS_DASHBOARD
} from './types/types';
const stsIcon = require('./sts.svg');

export function init($plugin: IPlugin, store: any) {
  const {
    product,
    configureType,
    virtualType,
    basicType,
    headers,
    // @ts-ignore -- though it's not in the interface, it is returned by the DSL
    spoofedType,
  } = $plugin.DSL(
    store,
    STACKSTATE_PRODUCT_NAME
  );
  const BLANK_CLUSTER = '_';

  product({
    // @ts-ignore -- though `svg` is not part of the interface, it does work.
    svg:                 stsIcon,
    name:                STACKSTATE_PRODUCT_NAME,
    label:               STACKSTATE_NAME,
    inStore:             'management',
    showClusterSwitcher: true,
    to:                  {
      name:   `stackstate-c-cluster-dashboard`,
      params: {
        product: STACKSTATE_PRODUCT_NAME,
        cluster: BLANK_CLUSTER,
      },
    },
  });

  virtualType({
    labelKey:            'sts.dashboard',
    name:                STS_DASHBOARD,
    displayName:         'Dashboard',
    showListMasthead:    false,
    route:               {
      name:   `stackstate-c-cluster-dashboard`,
      params: {
        product:  STACKSTATE_PRODUCT_NAME,
        cluster: BLANK_CLUSTER,
      }
    }
  });

  spoofedType(STACKSTATE_CLUSTER.typeDef!(store));
  headers(STACKSTATE_CLUSTER.name, STACKSTATE_CLUSTER.headers!);
  configureType(STACKSTATE_CLUSTER.name, STACKSTATE_CLUSTER.config);
  basicType([STACKSTATE_CLUSTER.name]);
  // spoofedType(STACKSTATE_CERTIFICATE.typeDef!(store));
  // headers(STACKSTATE_CERTIFICATE.name, STACKSTATE_CERTIFICATE.headers!);
  // configureType(STACKSTATE_CERTIFICATE.name, STACKSTATE_CERTIFICATE.config);
  // basicType([STACKSTATE_CERTIFICATE.name], 'SRE');
  configureType(STACKSTATE_SETTINGS.name, STACKSTATE_SETTINGS.config);
  headers(STACKSTATE_SETTINGS.name, STACKSTATE_SETTINGS.headers!);

  basicType([STACKSTATE_SETTINGS.name]);

  basicType([STS_DASHBOARD]);
}
