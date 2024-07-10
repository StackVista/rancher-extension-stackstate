import { ObservabilityState } from './index';

export default {
  componentTypes: (state: ObservabilityState) => state.componentTypes,
  apiURL:         (state: ObservabilityState) => state.apiURL,
  apiToken:       (state: ObservabilityState) => state.apiToken,
  serviceToken:   (state: ObservabilityState) => state.serviceToken,
  hasCredentials: (state: ObservabilityState) => {
    return state.apiURL && (state.apiToken || state.serviceToken);
  },
  isCrdMissing: (state: ObservabilityState) => state.missingCrd,
};
