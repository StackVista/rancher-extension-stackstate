import { ComponentType, ConnectionInfo } from '../types/component';

import { ObservabilityState } from './index';

export default {
  updateComponentTypes(state: ObservabilityState, val: Map<string, string>) {
    state.componentTypes = val;
  },
  addComponentType(state: ObservabilityState, val: ComponentType) {
    state.componentTypes.set(val.id, val.name);
  },
  setConnectionInfo(state: ObservabilityState, val: ConnectionInfo) {
    state.apiURL = val.apiURL;
    state.apiToken = val.apiToken;
    state.serviceToken = val.serviceToken;
  },
  setMissingCrd(state: ObservabilityState, val: boolean) {
    state.missingCrd = val;
  },
};
