import { MANAGEMENT, SECRET } from '@shell/config/types';
import { getSnapshot } from '../modules/stackstate';
import { UITypeDef } from './component';
import { STACKSTATE_PRODUCT_NAME } from './types';

export const STACKSTATE_CERTIFICATE: UITypeDef = {
  name:    'stackstate.io.certificate',
  typeDef: (store: any) => {
    return {
      labelKey:   'sts.certificates',
      name:       STACKSTATE_CERTIFICATE.name,
      type:       STACKSTATE_CERTIFICATE.name,
      namespaced: false,
      weight:     -1,
      route:      {
        name:   'c-cluster-product-resource',
        params: {
          product:  STACKSTATE_PRODUCT_NAME,
          resource: STACKSTATE_CERTIFICATE.name
        }
      },
      exact:   false,
      schemas: [
        {
          id:                STACKSTATE_CERTIFICATE.name,
          type:              'schema',
          collectionMethods: [],
          attributes:        { namespaced: false },
        },
      ],
      group:        'Root',
      getInstances: async() => {
        const rancherClusters = await store.dispatch('management/findAll', { type: MANAGEMENT.CLUSTER });
        const secrets = [];

        for (const cluster of rancherClusters) {
          const rancherSecrets = await store.dispatch('cluster/request', { url: `/k8s/clusters/${ cluster.id }/v1/${ SECRET }s` });
          const snapshot = await getSnapshot(store, `label in ("cluster-name:${ cluster.spec.displayName }") AND type = "secret" AND label in ("secret-type:certificate")`);
          const certHealth = new Map();

          // @ts-ignore
          if (snapshot.viewSnapshotResponse && snapshot.viewSnapshotResponse.components) {
            // @ts-ignore
            snapshot.viewSnapshotResponse.components.forEach((c: any) => {
              c.identifiers.forEach((i: string) => {
                certHealth.set(i, c.state.healthState);
              });
            });
          }

          const certificates = rancherSecrets.data.filter((c: any) => c._type === 'kubernetes.io/tls').map((c: any) => {
            const stackstateIdentifier = `urn:kubernetes:/${ cluster.spec.displayName }:${ c.metadata.namespace }:secret/${ c.metadata.name }`;

            if (certHealth.has(stackstateIdentifier)) {
              return {
                ...c,
                cluster,
                stackstateIdentifier,
                stackstateType: 'certificate',
                healthState:    certHealth.get(stackstateIdentifier),
                type:           STACKSTATE_CERTIFICATE.name
              };
            } else {
              return {};
            }
          }).filter((c: any) => c.metadata && c.metadata.name);

          secrets.push(...certificates);
        }

        return secrets;
      },
    };
  },
  headers: [
    {
      labelKey:      'sts.certificate.health',
      getValue:      (row: any) => row.healthState,
      sort:          ['stateSort'],
      formatter:     'HealthStateBadge',
      width:         100,
      formatterOpts: { arbitrary: true }
    },
    {
      labelKey:  'sts.certificate.label',
      value:     'metadata.name',
      sort:      'metadata.name',
      formatter: 'LinkDetail',
    },
    {
      labelKey: 'sts.cluster.label',
      value:    'cluster.spec.displayName',
      sort:      'cluster.spec.displayName',
    },
    {
      labelKey:  'sts.certificate.namespace',
      value:     'metadata.namespace',
      // sort:      ['namespaceSort'],
    },
  ],
  config:  {
    isCreatable:      false,
    isRemovable:      false,
    isEditable:       false,
    showListMasthead: false,
    canYaml:          false,
    showState:        false,
    displayName:      'Certificate',
  },
};
