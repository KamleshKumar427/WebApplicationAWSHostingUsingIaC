# Destroys all CDK stacks created by this app
$originalLocation = Get-Location
try {
  $repoRoot = Resolve-Path "$PSScriptRoot\..\.."
  Set-Location (Join-Path $repoRoot 'infra')
  cdk destroy --all --force --profile $env:AWS_PROFILE
}
finally {
  Set-Location $originalLocation
}
