import { OBSERVABILITY_PRODUCT_NAME, BLANK_CLUSTER, OBSERVABILITY_DASHBOARD } from '../types/types';
import ObservabilityDashboard from '../pages/dashboard.vue';

const routes = [
  {
    name:      `${ OBSERVABILITY_PRODUCT_NAME }-c-cluster-dashboard`,
    path:      `/${ OBSERVABILITY_PRODUCT_NAME }/c/:cluster/${ OBSERVABILITY_DASHBOARD }`,
    component: ObservabilityDashboard,
    meta:      {
      product: OBSERVABILITY_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
    }
  },
];

export default routes;
