import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ssm from 'aws-cdk-lib/aws-ssm';

interface FrontendStackProps extends cdk.StackProps {
  appName: string;
  ssmPrefix: string;
  backendHost: string;
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { appName, ssmPrefix, backendHost } = props;

    const backendOrigin = new origins.HttpOrigin(backendHost, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY
    });

    // S3 bucket for static site (auto-delete for review convenience)
    const bucket = new s3.Bucket(this, `${appName}-WebBucket`, {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, `${appName}-Distribution`, {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      defaultRootObject: 'index.html',
      additionalBehaviors: {
        'api/*': {
          origin: backendOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL
        }
      }
    });

    // SSM parameters your scripts read
    new ssm.StringParameter(this, `${appName}-SSM-FrontendBucket`, {
      parameterName: `${ssmPrefix}/frontend/bucket`,
      stringValue: bucket.bucketName
    });

    new ssm.StringParameter(this, `${appName}-SSM-FrontendDistId`, {
      parameterName: `${ssmPrefix}/frontend/distributionId`,
      stringValue: distribution.distributionId
    });

    new ssm.StringParameter(this, `${appName}-SSM-FrontendDomain`, {
      parameterName: `${ssmPrefix}/frontend/domain`,
      stringValue: distribution.domainName
    });

    // Helpful outputs
    new cdk.CfnOutput(this, 'FrontendBucket', { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'CloudFrontDomain', { value: distribution.domainName });
    new cdk.CfnOutput(this, 'CloudFrontDistributionId', { value: distribution.distributionId });
  }
}
