import { IPlugin } from '@rancher/shell/core/types';
import {
  OBSERVABILITY_PRODUCT_NAME,
  OBSERVABILITY_DASHBOARD,
} from './types/types';

const stsIcon = require('./rancher-observability.svg');
const styleSheet = document.createElement('style');
// css fix for SVG icon in Rancher 2.8 and 2.9
// it also fixes colors for both light and dark theme
const css = `
  .side-menu .category div a > img {
    display: block;
    width: 42px;
    font-size: 25px;
    margin-right: 14px;
  }
  .theme-dark .side-menu .category div a > img {
    filter: brightness(0) saturate(100%) invert(39%) sepia(90%) saturate(399%) hue-rotate(160deg) brightness(93%) contrast(95%)
  }
  .theme-dark .side-menu .category div a:hover > img, .side-menu .category div a.active-menu-link > img {
    filter:  brightness(0) invert(1);
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
    svg:                 stsIcon,
    name:                OBSERVABILITY_PRODUCT_NAME,
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
