const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authenticateToken = require("../middleware/authenticateToken");
const bodyParser = require("body-parser");
const { uploadImage  } = require("../middleware/multerConfig");

router.post(
  "/addComment",
  bodyParser.json(),
  authenticateToken,
  uploadImage.array('file'),
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
  "/lockComment",
  bodyParser.json(),
  authenticateToken,
  commentController.lockComment
);
router.patch(
  "/unlockComment",
  bodyParser.json(),
  authenticateToken,
  commentController.unlockComment
); 

router.patch(
  "/report",
  bodyParser.json(),
  authenticateToken,
  commentController.reportComment
);
router.patch(
  "/cancelUpvote",
  bodyParser.json(),
  authenticateToken,
  commentController.cancelUpvote
)
router.patch(
  "/cancelDownvote",
  bodyParser.json(),
  authenticateToken,
  commentController.cancelDownvote
)
router.get(
  "/replies",
  bodyParser.json(),
  commentController.getReplies
);

router.get(
  "/searchComments",
  bodyParser.json(),
  authenticateToken,
  commentController.commentSearch
);

router.get(
  "/subreddit/searchComment",
  bodyParser.json(),
  authenticateToken,
  commentController.subredditCommentSearch
);

module.exports = router;
