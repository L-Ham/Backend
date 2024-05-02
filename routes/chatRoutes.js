const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");
const chatController = require("../controllers/chatController");

router.post(
  "/sendMessage",
  bodyParser.json(),
  authenticateToken,
  chatController.sendMessage
);

module.exports = router;
