var express = require("express");
var router = express.Router();

router.get("/taskmaster-instructions", function (req, res, next) {
  return res.render("taskmaster-instructions", {
    title: "Hat Game: Taskmaster Instructions",
  });
});

module.exports = router;
