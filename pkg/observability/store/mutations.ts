import { ConnectionInfo } from '../types/component';

import { ObservabilityState } from './index';

export default {
  setConnectionInfo(state: ObservabilityState, val: ConnectionInfo) {
    state.apiURL = val.apiURL;
    state.apiToken = val.apiToken;
    state.serviceToken = val.serviceToken;
  },
  setMissingCrd(state: ObservabilityState, val: boolean) {
    state.missingCrd = val;
  },
  setRepoPresent(state: ObservabilityState, val: boolean) {
    state.repoPresent = val;
  }
};
