var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  return res.render("game-settings", {
    title: "Hat Game: Game Settings",
  });
});

module.exports = router;
