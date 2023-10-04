var express = require("express");
var router = express.Router();
const randomCapGenerator = require("../lib/randomCapGenerator");

router.post("/", function (req, res, next) {
  const roomCodeSequence = randomCapGenerator({ letters: 6 });
  return res.render("your-room-code", {
    title: "Hat Game: Your Room Code",
    roomCode: roomCodeSequence.next().value,
  });
});

module.exports = router;