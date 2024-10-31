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

### Applying Changesets

To apply changesets, use:

```bash
yarn changeset version
```

This command performs the following actions:

1. Combines all outstanding changesets per package and applies the most severe change type (`major` > `minor` > `patch`) to update each package version in its `package.json`.
2. Updates each affected package’s `CHANGELOG.md` with a summary of changes.
3. Deletes the processed changeset files from the `.changeset` directory.
