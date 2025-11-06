# --- Project-wide environment (edit these to your taste) ---
$env:AWS_PROFILE = "myapp"         # matches `aws configure --profile myapp`
$env:AWS_REGION  = "eu-north-1"    # keep consistent across CDK + CLI
$env:APP_NAME    = "myapp"         # short slug for names
$env:SSM_PREFIX  = "/myapp"        # SSM prefix where CDK stores values

# Helpful echo
Write-Host "Using profile: $env:AWS_PROFILE, region: $env:AWS_REGION, app: $env:APP_NAME"
