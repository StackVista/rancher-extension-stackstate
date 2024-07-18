import { IPlugin } from '@rancher/shell/core/types';
import {
  OBSERVABILITY_PRODUCT_NAME,
  OBSERVABILITY_DASHBOARD,
} from './types/types';

const stsIcon = require('./rancher-observability.svg');
const styleSheet = document.createElement('style');
// css fix for SVG icon in Rancher 2.8 and 2.9
const css = `
  .side-menu .category div a > img {
    display: block;
    width: 42px;
    font-size: 25px;
    margin-right: 14px;
  }
`;

styleSheet.textContent = css;
document.head.appendChild(styleSheet);
export function init($plugin: IPlugin, store: any) {
  const { product, virtualType, basicType } = $plugin.DSL(
    store,
    OBSERVABILITY_PRODUCT_NAME
  );
  const BLANK_CLUSTER = '_';

  product({
    // @ts-ignore -- though `svg` is not part of the interface, it does work.
    svg:  stsIcon,
    name: OBSERVABILITY_PRODUCT_NAME,

    label:               store.getters['i18n/t']('observability.name'),
    inStore:             'management',
    showClusterSwitcher: true,
    to:                  {
      name:   `${ OBSERVABILITY_PRODUCT_NAME }-c-cluster-dashboard`,
      params: {
        product: OBSERVABILITY_PRODUCT_NAME,
        cluster: BLANK_CLUSTER,
      },
    },
  });

  virtualType({
    labelKey:         'observability.dashboard.name',
    name:             OBSERVABILITY_DASHBOARD,
    displayName:      'Dashboard',
    showListMasthead: false,
    route:            {
      name:   `${ OBSERVABILITY_PRODUCT_NAME }-c-cluster-dashboard`,
      params: {
        product: OBSERVABILITY_PRODUCT_NAME,
        cluster: BLANK_CLUSTER,
      },
    },
  });

  basicType([OBSERVABILITY_DASHBOARD]);
}
