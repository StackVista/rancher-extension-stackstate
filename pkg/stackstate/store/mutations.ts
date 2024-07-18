import { ConnectionInfo } from '../types/component';

import { ObservabilityState } from './index';

export default {
  setConnectionInfo(state: ObservabilityState, val: ConnectionInfo) {
    state.apiURL = val.apiURL;
    state.apiToken = val.apiToken;
    state.serviceToken = val.serviceToken;
  },
};
