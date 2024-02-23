export async function isStackStateObserved(store: any, clusterId: string): Promise<any> {
  const response = await store.dispatch(`cluster/request`, { url: `/k8s/clusters/${ clusterId }/v1/apps.deployments` });

  return response.data.filter((depl: any) => depl.metadata.labels['app.kubernetes.io/name'] === 'stackstate-k8s-agent');
}
