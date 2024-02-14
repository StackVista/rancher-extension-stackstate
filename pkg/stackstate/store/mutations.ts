import { ComponentType } from '../types/component';

import { StackStateConfig } from './index';

export default {
  updateComponentTypes(state: StackStateConfig, val: Map<string, string>) {
    state.componentTypes = val;
  },
  addComponentType(state: StackStateConfig, val: ComponentType) {
    state.componentTypes.set(val.id, val.name);
  }
};
