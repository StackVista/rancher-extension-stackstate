import { IPlugin } from '@rancher/shell/core/types';
import {
  STACKSTATE_PRODUCT_NAME, STACKSTATE_NAME, DASHBOARD_PAGE, STS_SETTINGS_TYPE, STS_SETTINGS
} from './types/types';
const stsIcon = require('./sts.svg');

export function init($plugin: IPlugin, store: any) {
  const {
    product,
    configureType,
    virtualType,
    basicType
  } = $plugin.DSL(
    store,
    STACKSTATE_PRODUCT_NAME
  );
  const BLANK_CLUSTER = '_';

  product({
    svg:                 stsIcon,
    name:                STACKSTATE_PRODUCT_NAME,
    label:               STACKSTATE_NAME,
    inStore:             'management',
    showClusterSwitcher: true,
    to:                  {
      name:   `${ STACKSTATE_PRODUCT_NAME }-c-cluster-${ DASHBOARD_PAGE }`,
      params: {
        product: STACKSTATE_PRODUCT_NAME,
        cluster: BLANK_CLUSTER,
      },
    },
  });

  virtualType({
    labelKey:         'sts.dashboard',
    name:             DASHBOARD_PAGE,
    displayName:      'Dashboard',
    showListMasthead: false,
    route:            {
      name:   `${ STACKSTATE_PRODUCT_NAME }-c-cluster-${ DASHBOARD_PAGE }`,
      params: {
        product:  STACKSTATE_PRODUCT_NAME,
        resource: BLANK_CLUSTER,
      }
    }
  });

  virtualType({
    name:             STS_SETTINGS_TYPE,
    labelKey:         'sts.settings',
    displayName:      STS_SETTINGS,
    showListMasthead: false,
    route:            {
      name:   `${ STACKSTATE_PRODUCT_NAME }-c-cluster-${ STS_SETTINGS_TYPE }`,
      params: {
        product:  STACKSTATE_PRODUCT_NAME,
        resource: STS_SETTINGS_TYPE,
      }
    }
  });
  // virtualType({
  //   name: STS_DASHBOARD,
  //   labelKey:   'sts.settings',
  //   displayName: 'Settings',
  //   namespaced: false,
  //   route:       {
  //     name:   `${ STACKSTATE_NAME }-c-cluster-${ STS_DASHBOARD }`,
  //     params: {
  //       product: STACKSTATE_NAME,
  //       cluster: BLANK_CLUSTER,
  //     },
  //   },
  // });

  basicType([DASHBOARD_PAGE, STS_SETTINGS_TYPE]);
}
