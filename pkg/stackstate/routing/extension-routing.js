import { STACKSTATE_PRODUCT_NAME, BLANK_CLUSTER, STS_DASHBOARD } from '../types/types';
import StackStateDashboard from '../pages/dashboard.vue';

const routes = [
  {
    name:      `stackstate-c-cluster-dashboard`,
    path:      `/${ STACKSTATE_PRODUCT_NAME }/c/:cluster/${ STS_DASHBOARD }`,
    component: StackStateDashboard,
    meta:      {
      product: STACKSTATE_PRODUCT_NAME,
      cluster: BLANK_CLUSTER,
    }
  },
  // {
  //   name:      `${ STACKSTATE_PRODUCT_NAME }-c-cluster-${ STS_SETTINGS_TYPE }`,
  //   path:      `/${ STACKSTATE_PRODUCT_NAME }/c/:cluster/${ STS_SETTINGS_TYPE }`,
  //   component: StackStateDashboard,
  //   meta:      {
  //     product: STACKSTATE_PRODUCT_NAME,
  //     cluster: BLANK_CLUSTER,
  //     pkg:     STACKSTATE_PRODUCT_NAME
  //   }
  // }
  // {
  //   name: `c-cluster-${ STACKSTATE_NAME }-dashboard`,
  //   path: `/c/:cluster/:product/dashboard`,
  //   component: Dashboard,
  // },

];

export default routes;
