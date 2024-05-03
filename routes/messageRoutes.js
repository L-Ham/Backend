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

  router.get(
    "/getAllInbox",
    bodyParser.json(),
    authenticateToken,
    messageController.getAllInboxMessages
  );

  router.get(
    "/getSentMessages",
    bodyParser.json(),
    authenticateToken,
    messageController.getSentMessages
  );


  router.get(
    "/inbox/unread",
    bodyParser.json(),
    authenticateToken,
    messageController.getUnreadInboxMessages
  );

  router.delete(
    "/getSentMessages/unsend",
    bodyParser.json(),
    authenticateToken,
    messageController.unsendMessage
  );

  
  module.exports = router;