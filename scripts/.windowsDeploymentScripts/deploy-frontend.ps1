# Requires: scripts\.windowsDeploymentScripts\set-env.ps1 already run
$ErrorActionPreference = "Stop"
$Region = $env:AWS_REGION
$originalLocation = Get-Location
$previousPager = $env:AWS_PAGER
$env:AWS_PAGER = ""

try {
  # Read values from SSM
  $ApiUrl = aws ssm get-parameter --region $Region --name "$($env:SSM_PREFIX)/backend/url"             --query "Parameter.Value" --output text --profile $env:AWS_PROFILE --no-cli-pager
  $Bucket = aws ssm get-parameter --region $Region --name "$($env:SSM_PREFIX)/frontend/bucket"         --query "Parameter.Value" --output text --profile $env:AWS_PROFILE --no-cli-pager
  $DistId = aws ssm get-parameter --region $Region --name "$($env:SSM_PREFIX)/frontend/distributionId" --query "Parameter.Value" --output text --profile $env:AWS_PROFILE --no-cli-pager
  $Domain = aws ssm get-parameter --region $Region --name "$($env:SSM_PREFIX)/frontend/domain"         --query "Parameter.Value" --output text --profile $env:AWS_PROFILE --no-cli-pager

  # Build React with API URL injected
  $repoRoot = Resolve-Path "$PSScriptRoot\..\.."
  Set-Location (Join-Path $repoRoot 'frontend')
  npm install
  $env:VITE_API_URL = "https://$Domain/api"
  npm run build

  # Upload + invalidate
  aws s3 sync .\dist "s3://$Bucket" --delete --profile $env:AWS_PROFILE --no-cli-pager | Out-Null
  aws cloudfront create-invalidation --region $Region --profile $env:AWS_PROFILE --no-cli-pager `
    --distribution-id $DistId --paths "/*" | Out-Null

  Write-Host "Frontend deployed. Open: https://$Domain"
}
finally {
  Set-Location $originalLocation
  if ($previousPager -ne $null) {
    $env:AWS_PAGER = $previousPager
  } else {
    Remove-Item Env:AWS_PAGER -ErrorAction SilentlyContinue
  }
}
