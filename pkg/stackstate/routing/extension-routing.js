import { STACKSTATE_NAME, BLANK_CLUSTER } from '../types';
import Dashboard from '../pages/index.vue';

const routes = [
  {
    name:      `${ STACKSTATE_NAME }-c-cluster`,
    path:      `/${ STACKSTATE_NAME }/c/:cluster/test`,
    component: Dashboard,
    meta:      {
      product: STACKSTATE_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     STACKSTATE_NAME
    }
  },
  // {
  //   name: `c-cluster-${ STACKSTATE_NAME }-dashboard`,
  //   path: `/c/:cluster/:product/dashboard`,
  //   component: Dashboard,
  // },

];

export default routes;
