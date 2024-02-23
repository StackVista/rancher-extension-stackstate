import { CoreStoreConfig, CoreStoreSpecifics } from '@rancher/shell/core/types';
import { STACKSTATE_PRODUCT_NAME } from '../types/types';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';

export interface StackStateConfig {
  componentTypes: Map<string, string>;
  apiURL?: string;
  apiToken?: string;
}

const stackstateFactory = (config: StackStateConfig): CoreStoreSpecifics => {
  return {
    state: (): StackStateConfig => {
      return {
        componentTypes: config.componentTypes,
        apiURL:         config.apiURL,
        apiToken:       config.apiToken,
      };
    },
    getters:   { ...getters },
    mutations: { ...mutations },
    actions:   { ...actions },
  };
};

const config: CoreStoreConfig = { namespace: STACKSTATE_PRODUCT_NAME };

export default {
  specifics: stackstateFactory({
    componentTypes: new Map<string, string>(),
    apiURL:         'jvanerp.gke-sandbox.gcp.stackstate.io',
    apiToken:       '1234hoedjevanpapier',
  }),
  config,
};
