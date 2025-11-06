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

ECR_REPO_URI="$(aws ssm get-parameter \
  --region "${AWS_REGION}" \
  --name "${SSM_PREFIX}/ecr/repoUri" \
  --query 'Parameter.Value' \
  --output text \
  --profile "${AWS_PROFILE}" \
  --no-cli-pager)"

ECS_CLUSTER="$(aws ssm get-parameter \
  --region "${AWS_REGION}" \
  --name "${SSM_PREFIX}/ecs/cluster" \
  --query 'Parameter.Value' \
  --output text \
  --profile "${AWS_PROFILE}" \
  --no-cli-pager)"

ECS_SERVICE="$(aws ssm get-parameter \
  --region "${AWS_REGION}" \
  --name "${SSM_PREFIX}/ecs/service" \
  --query 'Parameter.Value' \
  --output text \
  --profile "${AWS_PROFILE}" \
  --no-cli-pager)"

cd "${REPO_ROOT}/backend"
IMAGE_TAG="review-$(date +%Y%m%d-%H%M%S)"
docker build -t "${APP_NAME}-backend:${IMAGE_TAG}" .

aws ecr get-login-password \
  --region "${AWS_REGION}" \
  --profile "${AWS_PROFILE}" \
  --no-cli-pager | docker login --username AWS --password-stdin "${ECR_REPO_URI}"

docker tag "${APP_NAME}-backend:${IMAGE_TAG}" "${ECR_REPO_URI}:${IMAGE_TAG}"
docker push "${ECR_REPO_URI}:${IMAGE_TAG}"

docker tag "${ECR_REPO_URI}:${IMAGE_TAG}" "${ECR_REPO_URI}:latest"
docker push "${ECR_REPO_URI}:latest"

aws ecs update-service \
  --region "${AWS_REGION}" \
  --profile "${AWS_PROFILE}" \
  --no-cli-pager \
  --cluster "${ECS_CLUSTER}" \
  --service "${ECS_SERVICE}" \
  --desired-count 1 \
  --force-new-deployment >/dev/null

echo "Backend deployed. ECS will pull the new image shortly."
