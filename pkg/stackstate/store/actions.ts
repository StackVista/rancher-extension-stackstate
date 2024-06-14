import { ComponentType, ConnectionInfo } from '../types/component';

export default {
  updateComponentTypes: ({ commit }: any, componentTypes: Map<string, string>) => {
    commit('updateComponentTypes', componentTypes);
  },

  addComponentType: ({ commit }: any, componentType: ComponentType) => {
    commit('addComponentType', componentType);
  },

  setConnectionInfo: ({ commit }: any, connectionInfo: ConnectionInfo) => {
    commit('setConnectionInfo', connectionInfo);
  }
};
