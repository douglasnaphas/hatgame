var express = require("express");
var router = express.Router();
const randomCapGenerator = require("../lib/randomCapGenerator");

router.post("/", function (req, res, next) {
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


  return res.render("your-room-code", {
    title: "Hat Game: Your Room Code",
    roomCode: roomCodeSequence.next().value,
  });
});

module.exports = router;
