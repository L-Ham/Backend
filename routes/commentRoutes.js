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
router.patch(
  "/upvote",
  bodyParser.json(),
  authenticateToken,
  commentController.upvote
);
router.patch(
  "/downvote",
  bodyParser.json(),
  authenticateToken,
  commentController.downvote
);

router.patch(
  "/report",
  bodyParser.json(),
  authenticateToken,
  commentController.reportComment
);


module.exports = router;
