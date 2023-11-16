var express = require("express");
const {
  DynamoDBClient,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const schema = require("../schema");
var router = express.Router();

const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });

router.get("/", async function (req, res, next) {
  if (!req.query["room-code"]) {
    return res.status(400).send();
  }
  try {
    const getItemInput = {
      TableName: schema.TABLE_NAME,
      Key: {
        [schema.PARTITION_KEY]: { S: req.query["room-code"] },
        [schema.SORT_KEY]: { S: schema.ROOM },
      },
    };
    const getItemCommand = new GetItemCommand(getItemInput);
    const getItemResponse = await dynamoDBClient.send(getItemCommand);
    return res.render("room-name", {
      roomName: getItemResponse.Item[schema.ROOM_NAME].S,
      layout: false
    });
  } catch (error) {
    console.log(error);
    console.log("room-name: failed to get room name", req.query["room-code"]);
    return res.status(500).send();
  }
});

module.exports = router;
