import { Construct } from "constructs";
import { CfnOutput } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { appBucket } from "./appBucket";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as s3 from "aws-cdk-lib/aws-s3";

export const appDistro = (
  scope: Construct,
  frontendBucket: s3.Bucket,
  domainNames?: string[],
  certificate?: acm.Certificate
) => {
  const distroLoggingBucket = appBucket(scope, "DistroLoggingBucket", {
    accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
  });
  const distroProps: any = {
    logBucket: distroLoggingBucket,
    logFilePrefix: "distribution-access-logs/",
    logIncludesCookies: true,
    defaultBehavior: {
      origin: new origins.S3Origin(frontendBucket),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
    },
    defaultRootObject: "index.html",
    domainNames,
    certificate,
  };
  const distro = new cloudfront.Distribution(scope, "Distro", distroProps);
  new CfnOutput(scope, "DistributionDomainName", {
    value: distro.distributionDomainName,
  });
  return distro;
};
