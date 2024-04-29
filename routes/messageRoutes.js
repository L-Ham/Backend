const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");
const messageController = require("../controllers/messageController");

router.post(
    "/compose",
    bodyParser.json(),
    authenticateToken,
    messageController.composeMessage
  );

  module.exports = router;