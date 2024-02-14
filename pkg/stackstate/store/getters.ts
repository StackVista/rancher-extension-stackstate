import { StackStateConfig } from './index';

export default {
  componentTypes: (state: StackStateConfig) => state.componentTypes,
  apiURL:         (state: StackStateConfig) => state.apiURL,
  apiToken:       (state: StackStateConfig) => state.apiToken,
};
