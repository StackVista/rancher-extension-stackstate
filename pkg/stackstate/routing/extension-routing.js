import { STACKSTATE_NAME, BLANK_CLUSTER } from '../types';
import Dashboard from '../pages/index.vue';

const routes = [
  {
    name:      `${ STACKSTATE_NAME }-c-cluster`,
    path:      `/${ STACKSTATE_NAME }/c/:cluster`,
    component: Dashboard,
    meta:      {
      product: STACKSTATE_NAME,
      cluster: BLANK_CLUSTER,
      pkg:     STACKSTATE_NAME
    }
  }
];

export default routes;
