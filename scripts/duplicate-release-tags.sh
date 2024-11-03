#!/bin/bash

# Description: This script duplicates Git tags containing '@' by replacing '@' with '-'
#              to support compatibility with workflows that may require the alternative naming.

# Exit immediately if any command fails
set -e

# Initialize a boolean flag for renamed tags
is_new_tag_created=false

# Loop through all tags containing '@' in their name
for tag in $(git tag -l '*@*'); do
  # Replace '@' with '-' in the tag name
  new_tag=${tag//@/-}

  # Check if the new tag already exists
  if [[ -z $(git tag -l "$new_tag") ]]; then
    echo "✅ Creating tag: $tag -> $new_tag"
    git tag "$new_tag" "$tag"
    is_new_tag_created=true # Set the flag to true when a tag is renamed
  else
    echo "Tag $new_tag already exists. Skipping..."
  fi
done

# Print the final message based on whether any tags were renamed
if $is_new_tag_created; then
  echo "🎉 Tag duplication completed successfully."
else
  echo "🔄 No missing tags to duplicate."
fi
