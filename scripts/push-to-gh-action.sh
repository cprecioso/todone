#!/usr/bin/env bash

set -euxo pipefail

current_sha=$(git rev-parse HEAD)

work_dir=$(mktemp -d)
packfile_path="$work_dir/package.tgz"
packfile_extracted_path="$work_dir/extracted"
action_repo_dir="$work_dir/repo"

# Build
nx run @todone/github-action:build
yarn workspace @todone/github-action pack --out "$packfile_path"

# Extract
mkdir -p "$packfile_extracted_path"
tar -xzf "$packfile_path" -C "$packfile_extracted_path"

# Prepare repo
gh repo clone cprecioso/todone-action "$action_repo_dir" -- --depth 1

# Replace files
rm -rf "${action_repo_dir:?}"/*
cp -r "$packfile_extracted_path"/package/* "$action_repo_dir"

# Commit and push
cd "$action_repo_dir"
git add .
git commit -m "$current_sha"
git push

# Clean up
rm -rf "$work_dir"
