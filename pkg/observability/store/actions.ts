import { ConnectionInfo } from '../types/component';

export default {
  setConnectionInfo: ({ commit }: any, connectionInfo: ConnectionInfo) => {
    commit('setConnectionInfo', connectionInfo);
  },

  setMissingCrd: ({ commit }: any, missingCrd: boolean) => {
    commit('setMissingCrd', missingCrd);
  },

  setRepoPresent: ({ commit }: any, repoPresent: boolean) => {
    commit('setRepoPresent', repoPresent);
  },
  setRoleTemplate: ({ commit }: any, roleTemplate: string) => {
    commit('setRoleTemplate', roleTemplate);
  }
};
