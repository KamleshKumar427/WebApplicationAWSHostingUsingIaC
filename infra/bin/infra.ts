#!/usr/bin/env ts-node

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

// You can set these via CDK context or rely on env.
// Your PowerShell scripts already export AWS_PROFILE/AWS_REGION.
const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

// Keep names aligned with your scripts
const appName   = process.env.APP_NAME   ?? 'myapp';
const ssmPrefix = process.env.SSM_PREFIX ?? '/myapp';

// 1) Network
const network = new NetworkStack(app, `${appName}-NetworkStack`, {
  env,
  appName
});

// 2) Backend (ECR, ECS Fargate + ALB, SSM)
const backend = new BackendStack(app, `${appName}-BackendStack`, {
  env,
  appName,
  vpc: network.vpc,
  ssmPrefix
});
backend.addDependency(network);

// 3) Frontend (S3 + CloudFront + SSM)
const frontend = new FrontendStack(app, `${appName}-FrontendStack`, {
  env,
  appName,
  ssmPrefix,
  backendHost: backend.loadBalancerDns
});
frontend.addDependency(network);
