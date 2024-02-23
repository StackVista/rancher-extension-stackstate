import { isEmpty } from 'lodash';
import { ComponentType } from 'types/component';

export async function loadComponentTypes(store: any): Promise<ComponentType[] | void> {
  const stackStateURL = await store.getters['stackstate/apiURL'];
  const stackStateToken = await store.getters['stackstate/apiToken'];

  if (!stackStateURL || !stackStateToken) {
    return;
  }

  const allComponentTypes = await store.dispatch(`management/request`, {
    url:     `meta/proxy/${ stackStateURL }/api/node/ComponentType`,
    method:  'GET',
    headers: { 'Content-Type': 'application/json', 'X-API-Auth-Header': `ApiKey ${ stackStateToken }` },
  });

  if (isEmpty(allComponentTypes)) {
    return;
  }

  for (const ct of allComponentTypes) {
    store.dispatch('stackstate/addComponentType', { id: ct.id, name: ct.name });
  }

  return allComponentTypes;
}

export async function getSnapshot(store: any, stql: string): Promise<any | void> {
  const stackStateURL = await store.getters['stackstate/apiURL'];
  const stackStateToken = await store.getters['stackstate/apiToken'];

  if (!stackStateURL || !stackStateToken) {
    return;
  }

  return store.dispatch('management/request', {
    url:     `meta/proxy/${ stackStateURL }/api/snapshot`,
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Auth-Header': `ApiKey ${ stackStateToken }` },
    data:    {
      query:        stql,
      queryVersion: '1.0',
      metadata:     {
        groupingEnabled:       false,
        showIndirectRelations: false,
        minGroupSize:          10,
        groupedByLayer:        false,
        groupedByDomain:       false,
        groupedByRelation:     false,
        autoGrouping:          false,
        connectedComponents:   false,
        neighboringComponents: false
      }
    },
  });
}
