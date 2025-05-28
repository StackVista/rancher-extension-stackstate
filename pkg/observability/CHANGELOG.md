# observability

## 2.1.5

### Patch Changes

- 1d34e7f: Add recommended access RoleTemplate

## 2.1.4

### Patch Changes

- e8fa25f: Drop builtin flag from RoleTemplates
  Include project and cluster Observer RoleTemplates

## 2.1.3

### Patch Changes

- cb2a4c0: Drop builtin flag from RoleTemplates

## 2.1.2

### Patch Changes

- fb3c813: Update the MonitorTab to fetch the `resource` data if the prop data is missing (mitigates https://github.com/rancher/dashboard/issues/14321)

## 2.1.1

### Patch Changes

- ee1a46b: Provision Role Templates from Helm chart

## 2.1.0

### Minor Changes

- 2ad9357: Provision RoleTemplates for RBAC

## 2.0.1

### Patch Changes

- ebd7f67: Drop the unsupported definition of `ProductOptions.label` field from `product.ts`.

## 2.0.0

### Major Changes

- f1941b8: Migrate SUSE Observability UI extension to be vue3 compliant.

  The new version of the extension is available at rancher@2.10.0.

## 1.0.1

### Patch Changes

- 0cd6f20: Delete not used `ObservabilityClusterCard.data.healthy` field
- 6be628b: Addresses the inconsistent product wording.

## 1.0.0

### Major Changes

- b0a6748: General availability release of SUSE Observability UI Extension for Rancher:

  - Removed Tech preview from the description
  - Renamed (most) StackState references to SUSE Observability
  - Install the suse-observability charts repo on "Install" button click

### Patch Changes

- d0d510f: Configure automated version and publishing using github CI
