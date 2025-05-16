#!/usr/bin/env bash

# "Strict" mode (https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/)
set -euxo pipefail

TSC=$(yarn bin tsc)
WORKSPACES=$(yarn workspaces list --json | jq -r '.location')

for WORKSPACE in $WORKSPACES; do
  if [ -f "$WORKSPACE/tsconfig.json" ]; then
    $TSC -p "$WORKSPACE" --noEmit
  fi
done
