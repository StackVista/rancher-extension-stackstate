# observability

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
