# Requires: scripts\set-env.ps1 already run in this session
$ErrorActionPreference = "Stop"
$originalLocation = Get-Location

try {
  Set-Location "$PSScriptRoot\..\infra"
  npm install

  # Bootstrap (first time per account/region)
  cdk bootstrap --profile $env:AWS_PROFILE

  # Deploy all stacks (network/backend/frontend)
  cdk deploy --all --profile $env:AWS_PROFILE

  Write-Host "`nCDK deploy finished."
  Write-Host "Key values are available in SSM under prefix $($env:SSM_PREFIX)."
}
finally {
  Set-Location $originalLocation
}
