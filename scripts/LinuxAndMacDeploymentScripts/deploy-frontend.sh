#!/usr/bin/env bash
set -euo pipefail

: "${AWS_PROFILE:?Environment variable AWS_PROFILE is not set. Run 'source scripts/linuxDeploymentScripts/set-env.sh' first.}"
: "${AWS_REGION:?Environment variable AWS_REGION is not set.}"
: "${APP_NAME:?Environment variable APP_NAME is not set.}"
: "${SSM_PREFIX:?Environment variable SSM_PREFIX is not set.}"

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

API_URL="$(aws ssm get-parameter \
  --region "${AWS_REGION}" \
  --name "${SSM_PREFIX}/backend/url" \
  --query 'Parameter.Value' \
  --output text \
  --profile "${AWS_PROFILE}" \
  --no-cli-pager)"

FRONTEND_BUCKET="$(aws ssm get-parameter \
  --region "${AWS_REGION}" \
  --name "${SSM_PREFIX}/frontend/bucket" \
  --query 'Parameter.Value' \
  --output text \
  --profile "${AWS_PROFILE}" \
  --no-cli-pager)"

FRONTEND_DIST_ID="$(aws ssm get-parameter \
  --region "${AWS_REGION}" \
  --name "${SSM_PREFIX}/frontend/distributionId" \
  --query 'Parameter.Value' \
  --output text \
  --profile "${AWS_PROFILE}" \
  --no-cli-pager)"

FRONTEND_DOMAIN="$(aws ssm get-parameter \
  --region "${AWS_REGION}" \
  --name "${SSM_PREFIX}/frontend/domain" \
  --query 'Parameter.Value' \
  --output text \
  --profile "${AWS_PROFILE}" \
  --no-cli-pager)"

cd "${REPO_ROOT}/frontend"
npm install
export VITE_API_URL="https://${FRONTEND_DOMAIN}/api"
npm run build

aws s3 sync ./dist "s3://${FRONTEND_BUCKET}" --delete --profile "${AWS_PROFILE}" --no-cli-pager >/dev/null
aws cloudfront create-invalidation \
  --region "${AWS_REGION}" \
  --profile "${AWS_PROFILE}" \
  --no-cli-pager \
  --distribution-id "${FRONTEND_DIST_ID}" \
  --paths "/*" >/dev/null

echo "Frontend deployed. Open: https://${FRONTEND_DOMAIN}"
