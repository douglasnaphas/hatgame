const express = require("express");
const router = express.Router();
router.get("/", async (req, res) => {
  console.log("join-continue-button: req", req);
  return res.render("join-continue-button", { layout: false });
});
module.exports = router;
