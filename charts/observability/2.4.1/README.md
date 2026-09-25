# SUSE Observability

The SUSE Observability UI Extension for Rancher enhances the user experience by integrating configuration, deployment and health status of SUSE Observability.

## Key Features

- **RBAC**: Using Role Templates, it is straightforward to scope access for users to Projects/Namespaces, Clusters.

- **Health Status**: The health status of Kubernetes resources is shown alongside other essential information.

## Getting Started

Before this extension can be used, [Install SUSE Observability](https://documentation.suse.com/cloudnative/suse-observability/latest/en/k8s-suse-rancher-prime.html).

## Prerequisites

- SUSE Observability
- Rancher 2.12.0+

## Cluster name discovery

The extension first reads `STS_CLUSTER_NAME` from the agent's cluster-name
ConfigMap. If no name is available, it inspects agent Deployments for a
`secretKeyRef` on `STS_CLUSTER_NAME` or `K8S_CLUSTER_NAME` and reads the referenced
key from that Secret in the Deployment's namespace. It does not list Secrets or
infer cluster names from API-key Secrets.

Secret lookup uses the current Rancher user's permissions. Users need `get`
access to the referenced Secret; the extension does not grant this access.
Kubernetes Secret access exposes the entire Secret, so prefer a dedicated
cluster-name Secret if users should not see the API key or other settings.

If the Secret is missing, unreadable or contains no usable cluster name, the
extension keeps the Rancher display-name fallback. That display name must match
the agent's cluster name for health views and component links to resolve correctly.
