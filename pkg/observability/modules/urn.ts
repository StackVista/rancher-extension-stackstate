import {
  mapKind, STS_CLUSTER,
  STS_NAMESPACE,
  STS_NODE
} from './stackstate';

export function buildUrn(component: any, clusterName: string | undefined): string | undefined {
  if (!component.type) {
    return undefined;
  }

  const kind = mapKind(component.type.toLowerCase());

  if (!clusterName) {
    throw new Error(`Cluster name is required for ${ kind } URN`);
  }

  const namespace = component.metadata?.namespace;
  const name = component.metadata?.name || component.name;

  switch (kind) {
  case STS_CLUSTER:
    return `urn:cluster:/${ clusterName }`;
  case STS_NODE:
    return `urn:kubernetes:/${ clusterName }:node/${ name }`;
  case STS_NAMESPACE:
    return `urn:kubernetes:/${ clusterName }:namespace/${ name }`;
  default:
    return `urn:kubernetes:/${ clusterName }:${ namespace }:${ kind }/${ name }`;
  }
}
