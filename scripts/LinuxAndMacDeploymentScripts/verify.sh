#!/usr/bin/env bash
set -euo pipefail

: "${AWS_PROFILE:?Environment variable AWS_PROFILE is not set. Run 'source scripts/linuxDeploymentScripts/set-env.sh' first.}"
: "${AWS_REGION:?Environment variable AWS_REGION is not set.}"
: "${SSM_PREFIX:?Environment variable SSM_PREFIX is not set.}"

if [[ -v AWS_PAGER ]]; then
  ORIGINAL_PAGER="${AWS_PAGER}"
  PAGER_WAS_SET=1
else
  PAGER_WAS_SET=0
fi

cleanup() {
  if [[ "${PAGER_WAS_SET}" -eq 1 ]]; then
    export AWS_PAGER="${ORIGINAL_PAGER}"
  else
    unset AWS_PAGER || true
  fi
}
trap cleanup EXIT

export AWS_PAGER=""

FRONTEND_DOMAIN="$(aws ssm get-parameter \
  --region "${AWS_REGION}" \
  --name "${SSM_PREFIX}/frontend/domain" \
  --query 'Parameter.Value' \
  --output text \
  --profile "${AWS_PROFILE}" \
  --no-cli-pager)"

BACKEND_URL="$(aws ssm get-parameter \
  --region "${AWS_REGION}" \
  --name "${SSM_PREFIX}/backend/url" \
  --query 'Parameter.Value' \
  --output text \
  --profile "${AWS_PROFILE}" \
  --no-cli-pager)"

echo "Frontend URL: https://${FRONTEND_DOMAIN}"
echo "Backend URL : ${BACKEND_URL}"
