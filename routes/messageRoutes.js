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
  router.patch(
    "/read",
    bodyParser.json(),
    authenticateToken,
    messageController.readMessage
  );

  router.patch(
    "/unread",
    bodyParser.json(),
    authenticateToken,
    messageController.unreadMessage
  );
  module.exports = router;