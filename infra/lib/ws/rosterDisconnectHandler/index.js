const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
exports.handler = async function (event, context) {
  try {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    const now = new Date();
    const putCommand = new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        PK: `roster_disconnect#${event.requestContext.connectionId}`,
        SK: now.toISOString(),
      },
    });
    const response = await docClient.send(putCommand);
    console.log("response", response);
    return {
      /*
        Are you even supposed to return from a disconnect handler, even on
        error?
      */
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
