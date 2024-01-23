import { IPlugin } from '@rancher/shell/core/types';
import { STACKSTATE_PRODUCT_NAME, STACKSTATE_NAME } from './types';
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
    weight:              100,
    showClusterSwitcher: true,
    to:                  {
      name:   `${ STACKSTATE_NAME }-c-cluster`,
      path:   `/${ STACKSTATE_NAME }/c/:cluster/dashboard`,
      params: {
        product: STACKSTATE_NAME,
        cluster: BLANK_CLUSTER,
        pkg:     STACKSTATE_NAME,
      },
    },
  });
}
