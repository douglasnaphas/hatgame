import {Stack, StackProps, CfnOutput} from "aws-cdk-lib";
import { Construct } from "constructs";
const appBucket = require("./appBucket");
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface AppStackProps extends StackProps {}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: AppStackProps) {
    super(scope, id, props);
    const frontendBucket = appBucket(this, "FrontendBucket");
  }
}
