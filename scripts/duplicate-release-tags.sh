#!/bin/bash

# duplicate release tags for the build-extension-charts workflow
for tag in $(git tag --list '*@*'); do
  # Replace '@' with '-'
  new_tag=${tag//@/-}

  echo "Renaming tag: $tag -> $new_tag"

  # Create the new tag
  git tag "$new_tag" "$tag"
done
