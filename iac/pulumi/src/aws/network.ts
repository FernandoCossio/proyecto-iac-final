import * as aws from "@pulumi/aws";
import { TenantConfig } from "../config";

export interface AwsNetworkResult {
  vpc: aws.ec2.Vpc;
  publicSubnet: aws.ec2.Subnet;
  backendSubnet: aws.ec2.Subnet;
  dbSubnet: aws.ec2.Subnet;
}

export function createAwsNetwork(config: TenantConfig): AwsNetworkResult {
  const commonTags = {
    TenantId: config.id,
    Environment: config.environment,
    Plan: config.plan,
    Project: "SistemaAsistencia",
    ManagedBy: "Pulumi",
  };

  const vpc = new aws.ec2.Vpc(`${config.id}-vpc`, {
    cidrBlock: config.vpcCidr,
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
      ...commonTags,
      Name: `${config.id}-vpc`,
    },
  });

  const igw = new aws.ec2.InternetGateway(`${config.id}-igw`, {
    vpcId: vpc.id,
    tags: {
      ...commonTags,
      Name: `${config.id}-igw`,
    },
  });

  const publicSubnet = new aws.ec2.Subnet(`${config.id}-subnet-frontend`, {
    vpcId: vpc.id,
    cidrBlock: config.publicSubnetCidr,
    mapPublicIpOnLaunch: true,
    tags: {
      ...commonTags,
      Name: `${config.id}-subnet-frontend-public`,
      Tier: "Frontend",
    },
  });

  const backendSubnet = new aws.ec2.Subnet(`${config.id}-subnet-backend`, {
    vpcId: vpc.id,
    cidrBlock: config.privateBackendSubnetCidr,
    mapPublicIpOnLaunch: false,
    tags: {
      ...commonTags,
      Name: `${config.id}-subnet-backend-private`,
      Tier: "Backend",
    },
  });

  const dbSubnet = new aws.ec2.Subnet(`${config.id}-subnet-database`, {
    vpcId: vpc.id,
    cidrBlock: config.isolatedDbSubnetCidr,
    mapPublicIpOnLaunch: false,
    tags: {
      ...commonTags,
      Name: `${config.id}-subnet-db-isolated`,
      Tier: "Database",
    },
  });

  const publicRouteTable = new aws.ec2.RouteTable(`${config.id}-rt-public`, {
    vpcId: vpc.id,
    routes: [
      {
        cidrBlock: "0.0.0.0/0",
        gatewayId: igw.id,
      },
    ],
    tags: {
      ...commonTags,
      Name: `${config.id}-rt-public`,
    },
  });

  new aws.ec2.RouteTableAssociation(`${config.id}-rta-public`, {
    subnetId: publicSubnet.id,
    routeTableId: publicRouteTable.id,
  });

  const privateRouteTable = new aws.ec2.RouteTable(`${config.id}-rt-private`, {
    vpcId: vpc.id,
    tags: {
      ...commonTags,
      Name: `${config.id}-rt-private`,
    },
  });

  new aws.ec2.RouteTableAssociation(`${config.id}-rta-backend`, {
    subnetId: backendSubnet.id,
    routeTableId: privateRouteTable.id,
  });

  new aws.ec2.RouteTableAssociation(`${config.id}-rta-db`, {
    subnetId: dbSubnet.id,
    routeTableId: privateRouteTable.id,
  });

  return {
    vpc,
    publicSubnet,
    backendSubnet,
    dbSubnet,
  };
}
