import { Stack, StackProps, CfnOutput, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_apigateway as apigw } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import { aws_route53_targets as targets } from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { appDistro } from "./appDistro";
import { WebSocketApi, WebSocketStage } from "@aws-cdk/aws-apigatewayv2-alpha";
import { WebSocketLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

export interface AppStackProps extends StackProps {
  domainName?: string;
  zoneId?: string;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);
    const { domainName, zoneId } = props;
    let hostedZone, wwwDomainName, certificate;
    let domainNames;
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
    const ddbTable = require("./table")(this);
    const webHandler = new lambda.Function(this, "WebHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("../lambda-express-hbs"),
      memorySize: 3000,
      environment: {
        NODE_ENV: "production",
        TABLE_NAME: ddbTable.tableName,
      },
      timeout: Duration.seconds(20),
    });
    ddbTable.grantReadWriteData(webHandler);
    const webApi = new apigw.LambdaRestApi(this, "WebApi", {
      handler: webHandler,
    });
    new CfnOutput(this, "WebApiUrl", {
      value: webApi.url,
    });
    const distro = appDistro(this, webApi, domainNames, certificate, this);
    if (domainName && wwwDomainName && hostedZone) {
      // point the domain name with an alias record to the distro
      const aliasRecord = new route53.ARecord(this, "Alias", {
        recordName: domainName,
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(distro)
        ),
      });
      const aliasWWWRecord = new route53.ARecord(this, "AliasWWW", {
        recordName: wwwDomainName,
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(distro)
        ),
      });
      const DNS_WEIGHT = 100;
      const cfnAliasRecordSet = aliasRecord.node
        .defaultChild as route53.CfnRecordSet;
      cfnAliasRecordSet.weight = DNS_WEIGHT;
      cfnAliasRecordSet.setIdentifier = "cf-alias";
      const cfnAliasWWWRecordSet = aliasWWWRecord.node
        .defaultChild as route53.CfnRecordSet;
      cfnAliasWWWRecordSet.weight = DNS_WEIGHT;
      cfnAliasWWWRecordSet.setIdentifier = "www-cf-alias";
    }

    new CfnOutput(this, "WebAppDomainName", {
      value: domainName || distro.distributionDomainName,
    });

    // WebSockets
    const wsOrp = new cloudfront.OriginRequestPolicy(
      this,
      "WSOriginRequestPolicy",
      {
        headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
          "Sec-WebSocket-Extensions",
          "Sec-WebSocket-Key",
          "Sec-WebSocket-Version"
        ),
        cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
        queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
      }
    );
    // ws-roster
    const rosterConnectHandler = new lambda.Function(
      this,
      "RosterConnectHandler",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("./lib/ws/rosterConnectHandler"),
        memorySize: 3000,
        environment: {
          NODE_ENV: "production",
          TABLE_NAME: ddbTable.tableName,
        },
        timeout: Duration.seconds(20),
      }
    );
    ddbTable.grantReadWriteData(rosterConnectHandler);
    const rosterDisconnectHandler = new lambda.Function(
      this,
      "RosterDisconnectHandler",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("./lib/ws/rosterConnectHandler"),
        memorySize: 3000,
        environment: {
          NODE_ENV: "production",
          TABLE_NAME: ddbTable.tableName,
        },
        timeout: Duration.seconds(20),
      }
    );
    ddbTable.grantReadWriteData(rosterDisconnectHandler);
    const wsRosterApi = new WebSocketApi(this, "WSRosterAPI", {
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "RosterConnectIntegration",
          rosterConnectHandler
        ),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "RosterDisconnectIntegration",
          rosterDisconnectHandler
        ),
      },
    });
    const wsRosterStageName = "ws-roster";
    const wsRosterStage = new WebSocketStage(this, "WSRosterStage", {
      webSocketApi: wsRosterApi,
      stageName: wsRosterStageName,
      autoDeploy: true,
    });
    distro.addBehavior(
      `/${wsRosterStageName}/*`,
      new origins.HttpOrigin(
        `${wsRosterApi.apiId}.execute-api.${this.region}.${this.urlSuffix}`,
        {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
        }
      ),
      {
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originRequestPolicy: wsOrp,
      }
    );
  }
}
