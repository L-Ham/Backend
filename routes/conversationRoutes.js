const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");
const conversationController = require("../controllers/conversationController");

router.post(
  "/create",
  bodyParser.json(),
  authenticateToken,
  conversationController.createChat
);

router.get(
  "/getUserChats",
  bodyParser.json(),
  authenticateToken,
  conversationController.getUserChats
);

module.exports = router;
