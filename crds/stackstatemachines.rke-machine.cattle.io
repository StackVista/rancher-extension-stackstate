apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: stackstatemachines.rke-machine.cattle.io
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
    plural: stackstatemachines
    singular: stackstatemachine
    kind: StackstateMachine
    listKind: StackstateMachineList
