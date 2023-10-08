import { Construct } from "constructs";
import { Duration, Stack } from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { appBucket } from "./appBucket";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as s3 from "aws-cdk-lib/aws-s3";
import { aws_apigateway as apigw } from "aws-cdk-lib";

const apiUrl = (api: apigw.LambdaRestApi, stack: Stack) =>
  api.restApiId + ".execute-api." + stack.region + "." + stack.urlSuffix;
export const appDistro = (
  scope: Construct,
  api: apigw.LambdaRestApi,
  domainNames: string[] | undefined,
  certificate: acm.Certificate | undefined,
  stack: Stack
) => {
  const distroLoggingBucket = appBucket(scope, "DistroLoggingBucket", {
    accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
  });
  const distroProps: any = {
    logBucket: distroLoggingBucket,
    logFilePrefix: "distribution-access-logs/",
    logIncludesCookies: true,
    defaultBehavior: {
      origin: new origins.HttpOrigin(apiUrl(api, stack), {
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
        originPath: "/prod",
      }),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: new cloudfront.CachePolicy(scope, "WebCachePolicy", {
        minTtl: Duration.seconds(0),
        maxTtl: Duration.seconds(120),
        defaultTtl: Duration.seconds(120),
      }),
      originRequestPolicy: new cloudfront.OriginRequestPolicy(scope, "ORP", {
        cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
        queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
      }),
    },
    domainNames,
    certificate,
  };
  const distro = new cloudfront.Distribution(scope, "Distro", distroProps);
  new CfnOutput(scope, "DistributionDomainName", {
    value: distro.distributionDomainName,
  });
  return distro;
};
