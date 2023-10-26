var express = require("express");
const {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} = require("@aws-sdk/client-dynamodb");
const schema = require("../schema");
var router = express.Router();
const randomCapGenerator = require("../lib/randomCapGenerator");

const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });
router.post("/", async function (req, res, next) {
  const roomCodeSequence = randomCapGenerator({ letters: 6 });
  if (
    !req.body["room-name"] ||
    !req.body["taskmaster-name"] ||
    !req.body["game-location"] ||
    !req.body["time-limit"]
  ) {
    console.log("randomCapGenerator: bad body, req:", req);
    return res.status(400).send();
  }
  const ATTEMPTS = 20;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const code = roomCodeSequence.next().value;
    const now = new Date();
    const putItemInput = {
      TableName: schema.TABLE_NAME,
      Item: {
        [schema.PARTITION_KEY]: {
          S: code,
        },
        [schema.SORT_KEY]: {
          S: schema.ROOM,
        },
        [schema.JS_DATE]: {
          S: now.toISOString(),
        },
        [schema.ROOM_NAME]: {
          S: req.body["room-name"],
        },
        [schema.TASKMASTER_NAME]: {
          S: req.body["taskmaster-name"],
        },
        [schema.GAME_LOCATION]: {
          S: req.body["game-location"],
        },
        [schema.TIME_LIMIT]: {
          S: req.body["time-limit"],
        },
      },
      ConditionExpression: `attribute_not_exists(${schema.PARTITION_KEY})`,
    };
    console.log("room-code: attempting to put item with", putItemInput);
    const putItemCommand = new PutItemCommand(putItemInput);
    try {
      const putItemResponse = await dynamoDBClient.send(putItemCommand);
      return res.status(303).header({ Location: `/room-code/${code}` });
    } catch (error) {
      console.log(error);
      console.log(
        "room-code: failed to create code; code, attempt:",
        code,
        attempt
      );
      continue;
    }
  }

  return res.status(500).send();
});
router.get("/:roomCode", async (req, res) => {
  try {
    const getItemInput = {
      TableName: schema.TableName,
      Key: {
        [schema.PARTITION_KEY]: { S: req.params.roomCode },
        [schema.SORT_KEY]: { S: schema.ROOM },
      },
    };
    const getItemCommand = new GetItemCommand(getItemInput);
    const getItemResponse = await dynamoDBClient.send(getItemCommand);
    return res.render("your-room-code", {
      title: "Hat Game: Your Room Code",
      roomCode: req.params.roomCode,
      taskMasterName: getItemResponse.Item[schema.TASKMASTER_NAME].S,
    });
  } catch (error) {
    console.log(error);
    console.log("room-code: failed to get room code", req.params.roomCode);
    return res.status(500).send();
  }
});
module.exports = router;
