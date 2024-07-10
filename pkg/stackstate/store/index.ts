import { CoreStoreConfig, CoreStoreSpecifics } from '@rancher/shell/core/types';
import { OBSERVABILITY_PRODUCT_NAME } from '../types/types';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';

export interface ObservabilityState {
  componentTypes: Map<string, string>;
  apiURL?: string;
  apiToken?: string;
  serviceToken?: string;
  missingCrd: boolean;
}

const observabilityStoreFactory = (config: ObservabilityState): CoreStoreSpecifics => {
  return {
    state: (): ObservabilityState => {
      return {
        componentTypes: config.componentTypes,
        apiURL:         config.apiURL,
        apiToken:       config.apiToken,
        serviceToken:   config.serviceToken,
        missingCrd:     false,
      };
    },
    getters:   { ...getters },
    mutations: { ...mutations },
    actions:   { ...actions },
  };
};

const config: CoreStoreConfig = { namespace: OBSERVABILITY_PRODUCT_NAME };

export default {
  specifics: observabilityStoreFactory({
    componentTypes: new Map<string, string>(),
    apiURL:         '',
    apiToken:       '',
    serviceToken:   '',
    missingCrd:     false,
  }),
  config,
};
