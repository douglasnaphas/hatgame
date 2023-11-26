const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    return res.render("join-a-room");
  } catch (error) {
    console.log(error);
    console.log("join: failed to show join page");
    return res.status(500).send(); // TODO: set up error pages
  }
});
router.post("/", async(req, res) => {
  // validate room code
  // validate name
  // write the participant to the db
  // redirect to /how-to-play
})

module.exports = router;
