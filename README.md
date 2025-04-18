# SUSE Rancher Observability UI Extension

## Versioning

This project uses [Changesets](https://github.com/changesets/changesets) to manage versioning and generate changelogs.

A changeset is a markdown file that records project changes, organized into two parts:

1. **YAML Frontmatter**: Specifies the affected packages and the change type (`major`, `minor`, or `patch`).
2. **Markdown Content**: Describes the changes in more detail.

### Adding a Changeset

Run the following command to create a new changeset:

```bash
yarn changeset
```

Then, follow the prompts:

1. Select the change type (`major`, `minor`, `patch`) for each package:
   - `major` for breaking changes
   - `minor` for new features
   - `patch` for bug fixes
2. Enter a summary of the change, which can be edited later in the generated markdown file.

This will create a new changeset file in the `.changeset` directory. Each changeset filename is a unique, randomly generated string, so do not try to make sense of it.

### Maintenance Branches

The `pkg/observability` package has a maintenance branch for each minor and major version:

- `v[\d+].x.x` supports the minor and patch versions for specified major versions, ex: `v1.x.x` supports `1.0.0`, `1.1.0`, `1.2.3`, etc.
- `v[\d+].[\d+].x` supports the patch version for specified minor versions, ex: `v1.2.x` supports `1.2.0`, `1.2.1`, `1.2.2`, etc.
- `main` is the latest version and can include breaking changes.

## End-to-End Process for Making and Releasing Changes

This section explains the complete workflow for making changes to the `pkg/observability` package and releasing them.

### 1. Making Changes

1. Clone the repository and navigate to the project directory.
2. Make the necessary changes to the code in the `pkg/observability` package.

### 2. Creating a Changeset

1. After making your changes, create a changeset by running:
   ```bash
   yarn changeset
   ```
2. Follow the prompts to specify the type of change (`major`, `minor`, or `patch`) and provide a summary of the changes.
3. A new changeset file will be created in the `.changeset` directory.

### 3. Submitting a Pull Request

1. Commit your changes along with the changeset file.
2. Push your changes to a new branch.
3. Open a pull request (PR) to the `main` OR maintenance branch `vx.x.x`.

### 4. CI Checks

1. When you open a PR, the CI pipeline will automatically run typecheck, linting, tests, build, and more to make sure everything is working correctly.
2. Merge the changes once the CI checks pass and the PR is approved.

### 5. Preparing the Changes Release

1. On every push to the `main` OR maintenance `vx.x.x` branches, the CI pipeline will:
   - Read the changeset status to determine the version bump.
   - Create/update a release pull request

### 6. Release the Changes

Once the release PR is merged, the CI pipeline will:

1. Assemble the release notes based on the changesets and update the `CHANGELOG.md` file.
2. Delete the changesets that have been released.
3. Bump the version in the `package.json` file.
4. Create a new release tag based on the version bump specified in the changeset.
5. Create a new release in the GitHub repository.
6. Commit the Helm charts and other artifacts to the `gh-pages` branch.

### 7. Including the Released Version in the Rancher Official Plugin Listing

Open a PR to the [rancher/ui-plugin-chart](https://github.com/rancher/ui-plugin-charts) repository with changes to the [manifest.json](https://github.com/rancher/ui-plugin-charts/blob/main/manifest.json) file to list the new version of the plugin for the `StackVista/rancher-extension-stackstate` repository (refer to this [PR example](https://github.com/rancher/ui-plugin-charts/pull/85)).

> Note: You can include multiple versions at once.

### Notes

- The `checks.yml` workflow ensures that only valid version bumps are allowed based on the branch type.
- The `release-tag` script handles tagging and duplicating release tags for compatibility.
