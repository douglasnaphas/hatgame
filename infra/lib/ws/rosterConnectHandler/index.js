import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
exports.handler = async function (event, context) {
  a;
  try {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    const now = new Date();
    const putCommand = new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        PK: event.queryStringParmaters.roomcode,
        SK: `roster_connection#${event.requestContext.connectionId}`,
        timestamp: now.toISOString(),
      },
    });
    const response = await docClient.send(command);
    console.log("response", response);
    return {
      statusCode: 200,
      body: "Connected",
    };
  } catch (error) {
    console.log("error", error);
    return {
      statusCode: 500,
      body: "Error",
    };
  }
};
