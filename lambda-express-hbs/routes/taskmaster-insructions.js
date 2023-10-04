var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  return res.render("taskmaster-instructions", {
    title: "Hat Game: Taskmaster Instructions",
  });
});

module.exports = router;
