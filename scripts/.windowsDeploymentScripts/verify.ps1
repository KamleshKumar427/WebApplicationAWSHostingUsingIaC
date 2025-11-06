$Region = $env:AWS_REGION
$previousPager = $env:AWS_PAGER
$env:AWS_PAGER = ""

try {
  $Domain = aws ssm get-parameter --region $Region --name "$($env:SSM_PREFIX)/frontend/domain" --query "Parameter.Value" --output text --profile $env:AWS_PROFILE --no-cli-pager
  $ApiUrl = aws ssm get-parameter --region $Region --name "$($env:SSM_PREFIX)/backend/url"    --query "Parameter.Value" --output text --profile $env:AWS_PROFILE --no-cli-pager

  Write-Host "Frontend URL: https://$Domain"
  Write-Host "Backend URL : $ApiUrl"
}
finally {
  if ($previousPager -ne $null) {
    $env:AWS_PAGER = $previousPager
  } else {
    Remove-Item Env:AWS_PAGER -ErrorAction SilentlyContinue
  }
}
