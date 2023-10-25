import { aws_dynamodb as dynamodb, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
const schema = require("../../lambda-express-hbs/schema");
const table: (construct: Construct) => dynamodb.Table = (
  construct: Construct
) => {
  const t = new dynamodb.Table(construct, "Table", {
    partitionKey: {
      name: schema.PARTITION_KEY,
      type: dynamodb.AttributeType.STRING,
    },
    sortKey: { name: schema.SORT_KEY, type: dynamodb.AttributeType.STRING },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy: RemovalPolicy.DESTROY,
    stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
  });
  return t;
};
module.exports = table;
