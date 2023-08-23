import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as s3 from "aws-cdk-lib/aws-s3";
// const appBucket = require("./appBucket");
import { appBucket } from "./appBucket";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface AppStackProps extends StackProps {
  domainName?: string;
  zoneId?: string;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);
    const { domainName, zoneId } = props;
    const frontendBucket = appBucket(this, "FrontendBucket");
    let hostedZone, wwwDomainName, certificate, domainNames;
    if (domainName && zoneId) {
      hostedZone = route53.HostedZone.fromHostedZoneAttributes(
        this,
        "HostedZone",
        { hostedZoneId: zoneId, zoneName: domainName + "." }
      );
      wwwDomainName = "www." + domainName;
      certificate = new acm.Certificate(this, "Certificate", {
        domainName,
        subjectAlternativeNames: [wwwDomainName],
        validation: acm.CertificateValidation.fromDns(hostedZone),
      });
      domainNames = [domainName, wwwDomainName];
    }
    const distroLoggingBucket = appBucket(this, "DistroLoggingBucket", {
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

    const distro = new cloudfront.Distribution(this, "Distro", distroProps);
  }
}
