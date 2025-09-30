apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: suse-observabilitymachines.rke-machine.cattle.io
spec:
  group: rke-machine.cattle.io
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties: {}
  scope: Namespaced
  names:
    plural: suse-observabilitymachines
    singular: suse-observabilitymachine
    kind: suse-observabilitymachine
    listKind: suse-observabilitymachineList
