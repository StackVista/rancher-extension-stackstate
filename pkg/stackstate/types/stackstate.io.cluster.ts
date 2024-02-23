import { MANAGEMENT } from '@shell/config/types';
import { isStackStateObserved } from '../modules/observed';
import { STACKSTATE_PRODUCT_NAME } from './types';
import { UITypeDef } from './component';

export const STACKSTATE_CLUSTER: UITypeDef = {
  name:    'stackstate.io.cluster',
  typeDef: (store: any) => {
    return {
      labelKey:   'sts.clusters',
      name:       STACKSTATE_CLUSTER.name,
      type:       STACKSTATE_CLUSTER.name,
      namespaced: false,
      weight:     0,
      route:      {
        name:   'c-cluster-product-resource',
        params: {
          product:  STACKSTATE_PRODUCT_NAME,
          resource: STACKSTATE_CLUSTER.name,
        }
      },
      exact:   false,
      schemas: [
        {
          id:                STACKSTATE_CLUSTER.name,
          type:              'schema',
          collectionMethods: [],
          resourceFields:    { stackstate: { type: 'object' } },
          attributes:        { namespaced: false },
        },
      ],
      group:        'Root',
      getInstances: async() => {
        const rancherClusters = store.dispatch('management/findAll', { type: MANAGEMENT.CLUSTER });
        const res = await rancherClusters;

        const clusters = await Promise.all(res.filter((c: any) => c.isReady)
          .map(async(c: any) => {
            return {
              ...c,
              type:       STACKSTATE_CLUSTER.name,
              stackstate: (await isStackStateObserved(store, c.id)),
            };
          }));

        return clusters;
      },
    };
  },
  headers:
    [
      {
        labelKey:      'sts.cluster.observed',
        getValue:      (row: any) => row.stackstate.length > 0 ? 'active' : 'inactive',
        sort:          ['stateSort'],
        formatter:     'HealthStateBadge',
        width:         100,
        formatterOpts: { arbitrary: true }
      },
      {
        labelKey:  'sts.cluster.label',
        value:     'spec.displayName',
        sort:      ['nameSort'],
        formatter: 'LinkDetail',
      },
      {
        labelKey:  'sts.cluster.namespace',
        getValue:  (row: any) => row.stackstate[0]?.metadata?.namespace,
        sort:      ['namespaceSort'],
        formatter: 'Code',
      }
    ],
  config:
    {
      isCreatable:      false,
      isRemovable:      false,
      isEditable:       false,
      showListMasthead: false,
      canYaml:          false,
      showState:        false,
      displayName:      'Cluster',
    }
};
