#!/usr/bin/env node
import "source-map-support/register";
import { AppStack, AppStackProps } from "../lib/app";
import { App } from "aws-cdk-lib";
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";
import {
  IAMClient,
  GetOpenIDConnectProviderCommand,
} from "@aws-sdk/client-iam";
const crypto = require("crypto");
import { RoleStack } from "../lib/roleStack";

const stackname = require("@cdk-turnkey/stackname");
const STACKNAME_HASH_LENGTH = 6;

(async () => {
  if (!process || !process.env || !process.env.GITHUB_REPOSITORY) {
    console.error(
      "The environment variable GITHUB_REPOSITORY must be set. It is used to name the stack,"
    );
    console.error("and to authenticate to AWS via GitHub and OpenID Connect.");
    console.error("It should be something like octocat/Hello-World. See:");
    console.error(
      "https://docs.github.com/en/actions/reference/environment-variables"
    );
    console.error(
      "https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services"
    );
    console.error("https://www.npmjs.com/package/@cdk-turnkey/stackname");
    const GITHUB_REPOSITORY_NOT_SET = 6;
    process.exit(GITHUB_REPOSITORY_NOT_SET);
  }
  if (!process.env.GITHUB_REF) {
    console.error(
      "The environment variable GITHUB_REF must be set. It is used to name the stack,"
    );
    console.error("and to authenticate to AWS via GitHub and OpenID Connect.");
    console.error(
      "It should be something like refs/heads/feature-branch-1. See:"
    );
    console.error(
      "https://docs.github.com/en/actions/reference/environment-variables"
    );
    console.error(
      "https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services"
    );
    console.error("https://www.npmjs.com/package/@cdk-turnkey/stackname");
    const GITHUB_REF_NOT_SET = 7;
    process.exit(GITHUB_REF_NOT_SET);
  }
  const app = new App();
  class ConfigParam {
    appParamName: string;
    ssmParamName = () =>
      stackname(this.appParamName, { hash: STACKNAME_HASH_LENGTH });
    ssmParamValue?: string;
    print = () => {
      console.log("appParamName");
      console.log(this.appParamName);
      console.log("ssmParamName:");
      console.log(this.ssmParamName());
      console.log("ssmParamValue:");
      console.log(this.ssmParamValue);
    };
    constructor(appParamName: string) {
      this.appParamName = appParamName;
    }
  }
  const configParams: Array<ConfigParam> = [
    new ConfigParam("domainName"),
    new ConfigParam("zoneId"),
  ];
  const ssmParams = {
    Names: configParams.map((c) => c.ssmParamName()),
    WithDecryption: true,
  };
  const region = process.env.AWS_DEFAULT_REGION;
  const ssmClient = new SSMClient({ region });
  const getParametersCommand = new GetParametersCommand(ssmParams);
  let ssmResponse: any;
  ssmResponse = await ssmClient.send(getParametersCommand);
  if (ssmResponse.$metadata.httpStatusCode !== 200) {
    console.log("error: unsuccessful SSM getParameters call, failing");
    console.log(ssmResponse);
    process.exit(1);
  }
  const ssmParameterData: any = {};
  let valueHash;
  ssmResponse?.Parameters?.forEach((p: { Name: string; Value: string }) => {
    console.log("Received parameter named:");
    console.log(p.Name);
    valueHash = crypto
      .createHash("sha256")
      .update(p.Value)
      .digest("hex")
      .toLowerCase();
    console.log("value hash:");
    console.log(valueHash);
    console.log("**************");
    ssmParameterData[p.Name] = p.Value;
  });
  console.log("==================");
  configParams.forEach((c) => {
    c.ssmParamValue = ssmParameterData[c.ssmParamName()];
  });
  const appProps: any = {};
  configParams.forEach((c) => {
    appProps[c.appParamName] = c.ssmParamValue;
  });
  // Param validation
  if (appProps.customProp) {
    // Validate the customProp, if provided
  }
  // TODO: print a hash of the IDP app secrets
  new AppStack(app, stackname("app", { hash: STACKNAME_HASH_LENGTH }), {
    ...(appProps as AppStackProps),
  });

  // Check for a GitHub OIDC Provider
  const client = new IAMClient({ region });
  const account = process.env.CDK_DEFAULT_ACCOUNT;
  const providerArn = `arn:aws:iam::${account}:oidc-provider/token.actions.githubusercontent.com`
  const input = {OpenIDConnectProviderArn: providerArn};
  const command = new GetOpenIDConnectProviderCommand(input);
  let response;
  try {
    response = await client.send(command);
  } catch (error: any) {
    if (error.Code === "ExpiredToken") {
      console.error(
        "expired token, try setting the variables AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SESSION_TOKEN to valid credentials, or setting a profile"
      );
      const EXPIRED_TOKEN = 2;
      process.exit(EXPIRED_TOKEN);
    }
    console.log("error getting OpenID Connect Provider");
    const ERROR_GETTING_PROVIDER = 4;
    console.log(`No provider with expected ARN ${providerArn}`)
    process.exit(ERROR_GETTING_PROVIDER);
  }
  const BAD_RESPONSE = 3;
  if (!response) {
    console.log(`No provider with expected ARN ${providerArn}`)
    process.exit(BAD_RESPONSE);
  }

  const subject = `repo:${process.env.GITHUB_REPOSITORY}:ref:${process.env.GITHUB_REF}`;

  new RoleStack(app, stackname("role", { hash: STACKNAME_HASH_LENGTH }), {
    providerArn,
    subject,
  });
})();
