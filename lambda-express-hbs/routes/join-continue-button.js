const express = require("express");
const router = express.Router();
router.get("/", async (req, res) => {
  return res.render("join-continue-button", { layout: false });
});
module.exports = router;
