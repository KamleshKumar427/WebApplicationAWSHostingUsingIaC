# Requires: scripts\set-env.ps1 already run; Docker Desktop running
$ErrorActionPreference = "Stop"
$Region = $env:AWS_REGION
$originalLocation = Get-Location

function Assert-LastExit {
  param(
    [string] $Message
  )

  if ($LASTEXITCODE -ne 0) {
    throw $Message
  }
}

try {
  # Read infra values from SSM (written by CDK)
  $EcrRepoUri = aws ssm get-parameter --region $Region --name "$($env:SSM_PREFIX)/ecr/repoUri" --query "Parameter.Value" --output text --profile $env:AWS_PROFILE
  Assert-LastExit "Failed to read SSM parameter $($env:SSM_PREFIX)/ecr/repoUri"

  $EcsCluster = aws ssm get-parameter --region $Region --name "$($env:SSM_PREFIX)/ecs/cluster" --query "Parameter.Value" --output text --profile $env:AWS_PROFILE
  Assert-LastExit "Failed to read SSM parameter $($env:SSM_PREFIX)/ecs/cluster"

  $EcsService = aws ssm get-parameter --region $Region --name "$($env:SSM_PREFIX)/ecs/service" --query "Parameter.Value" --output text --profile $env:AWS_PROFILE
  Assert-LastExit "Failed to read SSM parameter $($env:SSM_PREFIX)/ecs/service"

  # Build image
  Set-Location "$PSScriptRoot\..\backend"
  $ImageTag = "review-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  docker build -t "$($env:APP_NAME)-backend:$ImageTag" .
  Assert-LastExit "Docker build failed for $($env:APP_NAME)-backend:$ImageTag"

  # ECR login
  aws ecr get-login-password --region $Region --profile $env:AWS_PROFILE | docker login --username AWS --password-stdin $EcrRepoUri
  Assert-LastExit "Docker login to $EcrRepoUri failed"

  # Tag & push (immutable tag)
  docker tag "$($env:APP_NAME)-backend:$ImageTag" "${EcrRepoUri}:$ImageTag"
  Assert-LastExit "Failed to tag image $($env:APP_NAME)-backend:$ImageTag as ${EcrRepoUri}:$ImageTag"

  docker push "${EcrRepoUri}:$ImageTag"
  Assert-LastExit "Failed to push image ${EcrRepoUri}:$ImageTag"

  docker tag "${EcrRepoUri}:$ImageTag" "${EcrRepoUri}:latest"
  Assert-LastExit "Failed to tag image ${EcrRepoUri}:$ImageTag as ${EcrRepoUri}:latest"

  docker push "${EcrRepoUri}:latest"
  Assert-LastExit "Failed to push image ${EcrRepoUri}:latest"

  # Roll service
  aws ecs update-service --region $Region --profile $env:AWS_PROFILE `
    --cluster $EcsCluster --service $EcsService --desired-count 1 --force-new-deployment
  Assert-LastExit "Failed to scale or trigger new deployment for ECS service $EcsService in cluster $EcsCluster"

  Write-Host "Backend deployed. ECS will pull the new image shortly."
}
finally {
  Set-Location $originalLocation
}
