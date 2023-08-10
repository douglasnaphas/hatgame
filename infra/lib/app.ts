import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
const appBucket = require("./appBucket");
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface AppStackProps extends cdk.StackProps {}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: AppStackProps) {
    super(scope, id, props);
    const frontendBucket = appBucket(this, "FrontendBucket");
  }
}
