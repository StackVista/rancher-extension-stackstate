import { ConnectionInfo } from '../types/component';

export default {
  setConnectionInfo: ({ commit }: any, connectionInfo: ConnectionInfo) => {
    commit('setConnectionInfo', connectionInfo);
  },

  setMissingCrd: ({ commit }: any, missingCrd: boolean) => {
    commit('setMissingCrd', missingCrd);
  }
};
