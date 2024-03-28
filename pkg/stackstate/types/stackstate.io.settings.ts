import { UITypeDef } from './component';
import { BLANK_CLUSTER, STACKSTATE_PRODUCT_NAME } from './types';

const STS_SETTINGS_TYPE = 'stackstate.io.setting';

export const STACKSTATE_SETTINGS: UITypeDef = {
  name:   STS_SETTINGS_TYPE,
  config: {
    isCreatable:      true,
    isRemovable:      true,
    isEditable:       true,
    showListMasthead: true,
    canYaml:          true,
    showState:        true,
    showAge:          true,
    namespaced:       false,
    displayName:      'Settings',
    customRoute:      {
      name:   'c-cluster-product-resource',
      params: {
        product:  STACKSTATE_PRODUCT_NAME,
        cluster:  BLANK_CLUSTER,
        resource: STS_SETTINGS_TYPE
      },
    }
  },
  headers: [
    {
      labelKey: 'sts.settings.label',
      value:    'metadata.name',
      sort:     'metadata.name',
    },
  ],
};
