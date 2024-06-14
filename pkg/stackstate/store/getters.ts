import { StackStateConfig } from './index';

export default {
  componentTypes: (state: StackStateConfig) => state.componentTypes,
  apiURL:         (state: StackStateConfig) => state.apiURL,
  apiToken:       (state: StackStateConfig) => state.apiToken,
  serviceToken:   (state: StackStateConfig) => state.serviceToken,
  hasCredentials: (state: StackStateConfig) => {
    console.log('hasCredentials', state.apiURL, state.apiToken, state.serviceToken);

    return state.apiURL && (state.apiToken || state.serviceToken);
  },
};
