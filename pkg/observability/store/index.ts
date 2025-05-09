import { CoreStoreConfig, CoreStoreSpecifics } from '@rancher/shell/core/types';
import { OBSERVABILITY_PRODUCT_NAME } from '../types/types';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';

export interface ObservabilityState {
  apiURL?: string;
  apiToken?: string;
  serviceToken?: string;
  missingCrd: boolean;
  repoPresent?: boolean;
  roleTemplates?: Set<string>
}

const observabilityStoreFactory = (config: ObservabilityState): CoreStoreSpecifics => {
  return {
    state: (): ObservabilityState => {
      return {
        apiURL:         config.apiURL,
        apiToken:       config.apiToken,
        serviceToken:   config.serviceToken,
        missingCrd:   config.missingCrd,
        repoPresent:    config.repoPresent,
        roleTemplates:  config.roleTemplates,
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
    apiURL:         '',
    apiToken:       '',
    serviceToken:   '',
    missingCrd:   false,
    repoPresent:    true,
    roleTemplates: new Set()
  }),
  config,
};
