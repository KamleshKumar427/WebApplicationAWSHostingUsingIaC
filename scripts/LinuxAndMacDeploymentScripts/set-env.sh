#!/usr/bin/env bash
# --- Project-wide environment (edit these to your taste) ---
export AWS_PROFILE="myapp"         # matches `aws configure --profile myapp`
export AWS_REGION="eu-north-1"     # keep consistent across CDK + CLI
export APP_NAME="myapp"            # short slug for names
export SSM_PREFIX="/myapp"         # SSM prefix where CDK stores values

echo "Using profile: ${AWS_PROFILE}, region: ${AWS_REGION}, app: ${APP_NAME}"
