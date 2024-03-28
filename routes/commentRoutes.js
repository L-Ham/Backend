const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authenticateToken = require("../middleware/authenticateToken");
const bodyParser = require("body-parser");

router.post(
  "/addComment",
  bodyParser.json(),
  authenticateToken,
  commentController.createComment
);

module.exports = router;
