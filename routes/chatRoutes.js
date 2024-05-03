const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");
const chatController = require("../controllers/chatController");
const { uploadImage } = require("../middleware/multerConfig");

router.post(
  "/sendMessage",
  bodyParser.json(),
  authenticateToken,
  uploadImage.array("file"),
  chatController.sendMessage
);

module.exports = router;
