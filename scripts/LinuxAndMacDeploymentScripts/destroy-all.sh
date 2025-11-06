#!/usr/bin/env bash
set -euo pipefail

: "${AWS_PROFILE:?Environment variable AWS_PROFILE is not set. Run 'source scripts/linuxDeploymentScripts/set-env.sh' first.}"
: "${AWS_REGION:?Environment variable AWS_REGION is not set.}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ORIGINAL_DIR="$(pwd)"

if [[ -v AWS_PAGER ]]; then
  ORIGINAL_PAGER="${AWS_PAGER}"
  PAGER_WAS_SET=1
else
  PAGER_WAS_SET=0
fi

cleanup() {
  cd "${ORIGINAL_DIR}"
  if [[ "${PAGER_WAS_SET}" -eq 1 ]]; then
    export AWS_PAGER="${ORIGINAL_PAGER}"
  else
    unset AWS_PAGER || true
  fi
}
trap cleanup EXIT

export AWS_PAGER=""

cd "${REPO_ROOT}/infra"
cdk destroy --all --force --require-approval never --profile "${AWS_PROFILE}"

if aws cloudformation describe-stacks --stack-name CDKToolkit --region "${AWS_REGION}" --profile "${AWS_PROFILE}" --no-cli-pager >/dev/null 2>&1; then
  cdk destroy CDKToolkit --force --require-approval never --profile "${AWS_PROFILE}"
fi
