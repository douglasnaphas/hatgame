const express = require("express");
const router = express.Router();
const schema = require("../schema");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
router.get("/", async (req, res) => {
  console.log("join-continue-button: req", req);
  if (!req.query || !req.query.name || req.query.name === "") {
    return res.render("join-continue-button", { layout: false, valid: false });
  }
  if (
    !req.query.roomCode ||
    req.query.roomCode === "" ||
    /[^A-Z]/.test(req.query.roomCode)
  ) {
    return res.render("join-continue-button", { layout: false, valid: false });
  }
  const getParticipantCommand = new GetCommand({
    TableName: schema.TABLE_NAME,
    Key: {
      PK: req.query.roomCode,
      SK: `${schema.PARTICIPANT}${schema.SEPARATOR}req.query.name`,
    },
  });
  const getParticipantResponse = await docClient.send(getParticipantCommand);
  console.log(
    "join-continue-button, getParticipantResponse",
    getParticipantResponse
  );

  return res.render("join-continue-button", { layout: false, valid: true });
});
module.exports = router;
