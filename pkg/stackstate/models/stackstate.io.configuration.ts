import NormanModel from '@shell/plugins/steve/norman-class';

export const DEFAULT_STS_SETTINGS = {
  apiVersion: 'stackstate.io/v1alpha1',
  kind:       'Configuration',
  metadata:   {
    annotations: {},
    labels:      {},
    name:        ''
  },
  spec: {
    stackStateURL:   '',
    stackStateToken: '',
  }
};

export default class Model extends NormanModel { }
