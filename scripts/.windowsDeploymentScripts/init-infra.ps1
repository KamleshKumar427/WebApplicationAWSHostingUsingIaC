# Requires: scripts\.windowsDeploymentScripts\set-env.ps1 already run in this session
$ErrorActionPreference = "Stop"
$originalLocation = Get-Location

try {
  $repoRoot = Resolve-Path "$PSScriptRoot\..\.."
  Set-Location (Join-Path $repoRoot 'infra')
  npm install

  # Bootstrap (first time per account/region)
  cdk bootstrap --require-approval never --profile $env:AWS_PROFILE

  # Deploy all stacks (network/backend/frontend)
  cdk deploy --all --require-approval never --profile $env:AWS_PROFILE

  Write-Host "`nCDK deploy finished."
  Write-Host "Key values are available in SSM under prefix $($env:SSM_PREFIX)."
}
finally {
  Set-Location $originalLocation
}
