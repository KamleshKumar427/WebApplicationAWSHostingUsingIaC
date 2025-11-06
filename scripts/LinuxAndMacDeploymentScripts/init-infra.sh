#!/usr/bin/env bash
set -euo pipefail

: "${AWS_PROFILE:?Environment variable AWS_PROFILE is not set. Run 'source scripts/linuxDeploymentScripts/set-env.sh' first.}"
: "${AWS_REGION:?Environment variable AWS_REGION is not set.}"
: "${APP_NAME:?Environment variable APP_NAME is not set.}"
: "${SSM_PREFIX:?Environment variable SSM_PREFIX is not set.}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ORIGINAL_DIR="$(pwd)"

trap 'cd "${ORIGINAL_DIR}"' EXIT

cd "${REPO_ROOT}/infra"
npm install

# Bootstrap (first time per account/region)
cdk bootstrap --require-approval never --profile "${AWS_PROFILE}"

# Deploy all stacks (network/backend/frontend)
cdk deploy --all --require-approval never --profile "${AWS_PROFILE}"

echo
echo "CDK deploy finished."
echo "Key values are available in SSM under prefix ${SSM_PREFIX}."
