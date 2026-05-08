export const OBSERVABILITY_PRODUCT_NAME = "observability";
export const BLANK_CLUSTER = "_";

export const OBSERVABILITY_DASHBOARD = "observability.rancher.io.dashboard";

export const OBSERVABILITY_CONFIGURATION_TYPE =
  "observability.rancher.io.configuration";

export const SUSEOBSERVABILITYMACHINES_CRD = {
  apiVersion: "apiextensions.k8s.io/v1",
  kind: "CustomResourceDefinition",
  metadata: {
    name: "suse-observabilitymachines.rke-machine.cattle.io",
  },
  spec: {
    group: "rke-machine.cattle.io",
    versions: [
      {
        name: "v1",
        served: true,
        storage: true,
        schema: {
          openAPIV3Schema: {
            type: "object",
            properties: {},
          },
        },
      },
    ],
    scope: "Namespaced",
    names: {
      plural: "suse-observabilitymachines",
      singular: "suse-observabilitymachine",
      kind: "suse-observabilitymachine",
      listKind: "suse-observabilitymachineList",
    },
  },
};

export const HEALTH_STATE_TYPES = {
  UNKNOWN: "UNKNOWN",
  CLEAR: "CLEAR",
  DEVIATING: "DEVIATING",
  CRITICAL: "CRITICAL",
  CONNECTION_ERROR: "CONNECTION_ERROR",
  UNCONFIGURED: "UNCONFIGURED",
};
