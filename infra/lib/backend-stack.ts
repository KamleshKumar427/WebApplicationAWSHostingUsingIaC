import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface BackendStackProps extends cdk.StackProps {
  appName: string;
  vpc: ec2.IVpc;
  ssmPrefix: string;
}

export class BackendStack extends cdk.Stack {
  public readonly loadBalancerDns: string;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const { appName, vpc, ssmPrefix } = props;

    // ECR repo for backend images
    const repo = new ecr.Repository(this, `${appName}-BackendRepo`, {
      repositoryName: `${appName}-backend`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteImages: true
    });

    // ECS cluster
    const cluster = new ecs.Cluster(this, `${appName}-Cluster`, {
      vpc
    });

    // Fargate service with ALB
    const fargate = new ecs_patterns.ApplicationLoadBalancedFargateService(
    this,
    `${appName}-AlbFargateService`,
    {
        cluster,
        cpu: 256,
        memoryLimitMiB: 512,
        desiredCount: 1,
        publicLoadBalancer: true,
        taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repo, 'latest'),
        containerName: `${appName}-container`,
        containerPort: 8080
        }
    }
    );

    const cfnService = fargate.service.node.defaultChild as ecs.CfnService;
    cfnService.desiredCount = 0;

    // Health check path (adjust if your API serves /api/health)
    fargate.targetGroup.configureHealthCheck({
      path: '/health',
      healthyHttpCodes: '200-399'
    });

    // SSM parameters used by your scripts
    new ssm.StringParameter(this, `${appName}-SSM-EcrRepoUri`, {
      parameterName: `${ssmPrefix}/ecr/repoUri`,
      stringValue: repo.repositoryUri
    });

    new ssm.StringParameter(this, `${appName}-SSM-EcsCluster`, {
      parameterName: `${ssmPrefix}/ecs/cluster`,
      stringValue: cluster.clusterName
    });

    new ssm.StringParameter(this, `${appName}-SSM-EcsService`, {
      parameterName: `${ssmPrefix}/ecs/service`,
      stringValue: fargate.service.serviceName
    });

    const lbDns = fargate.loadBalancer.loadBalancerDnsName;
    this.loadBalancerDns = lbDns;
    new ssm.StringParameter(this, `${appName}-SSM-BackendUrl`, {
      parameterName: `${ssmPrefix}/backend/url`,
      stringValue: `http://${lbDns}`
    });

    // Helpful outputs
    new cdk.CfnOutput(this, 'EcrRepoUri', { value: repo.repositoryUri });
    new cdk.CfnOutput(this, 'EcsClusterName', { value: cluster.clusterName });
    new cdk.CfnOutput(this, 'EcsServiceName', { value: fargate.service.serviceName });
    new cdk.CfnOutput(this, 'BackendUrl', { value: `http://${lbDns}` });
  }
}
