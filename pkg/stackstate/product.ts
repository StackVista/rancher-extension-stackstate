import { IPlugin } from '@rancher/shell/core/types';
import { STACKSTATE_PRODUCT_NAME, STACKSTATE_NAME, STS_DASHBOARD } from './types';
const stsIcon = require('./sts.svg');

export function init($plugin: IPlugin, store: any) {
  const { product, virtualType, basicType } = $plugin.DSL(
    store,
    STACKSTATE_PRODUCT_NAME
  );
  const BLANK_CLUSTER = '_';

  product({
    svg:                 stsIcon,
    name:                STACKSTATE_NAME,
    label:               STACKSTATE_PRODUCT_NAME,
    inStore:             'management',
    weight: 100,
    inExplorer:          true,
    to:                  {
      name:   `${ STACKSTATE_NAME }-c-cluster`,
      params: {
        product: STACKSTATE_NAME,
        cluster: BLANK_CLUSTER,
      },
    },
  });

  // virtualType({
  //   ifHaveType: STS_DASHBOARD,
  //   labelKey:   'advancedSettings.label',
  //   name:       'Dashboard',
  //   namespaced: false,
  //   weight:     100,
  //   icon:       'folder',
  //   route:      {
  //     name:   `${ STACKSTATE_NAME }-c-cluster`,
  //     params: {
  //       product:  STACKSTATE_NAME,
  //       resource: BLANK_CLUSTER,
  //     }
  //   }
  // });

  basicType(['provisioning.cattle.io.cluster', STS_DASHBOARD]);
}
