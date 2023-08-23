import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { AppStack, AppStackProps } from "../lib/app";

test("Can instantiate stack", () => {
  const app = new cdk.App();
  //     // WHEN
  const stack = new AppStack(app, "MyTestStack", {});
  //     // THEN
  const template = Template.fromStack(stack);

  //   template.hasResourceProperties('AWS::SQS::Queue', {
  //     VisibilityTimeout: 300
  //   });
});
