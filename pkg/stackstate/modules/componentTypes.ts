import { isEmpty, map } from 'lodash';
import { ComponentType } from 'types/component';

export async function getComponentTypes(store: any): Promise<ComponentType[] | void> {
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

  const cts = new Map<string, string>();

  for (const ct of allComponentTypes) {
    store.dispatch('stackstate/addComponentType', { id: ct.id, name: ct.name });
  }

  return allComponentTypes;
}
