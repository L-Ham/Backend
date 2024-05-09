const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");
const { auth } = require("google-auth-library");
const { uploadImage } = require("../middleware/multerConfig");

router.post(
  "/createPost",
  bodyParser.json(),
  authenticateToken,
  uploadImage.array("file"),
  postController.createPost
);
router.patch(
  "/editPost",
  bodyParser.json(),
  authenticateToken,
  postController.editPost
);
router.delete(
  "/deletePost",
  bodyParser.json(),
  authenticateToken,
  postController.deletePost
);
router.patch(
  "/save",
  bodyParser.json(),
  authenticateToken,
  postController.savePost
);

router.delete(
  "/unsave",
  bodyParser.json(),
  authenticateToken,
  postController.unsavePost
);

router.patch(
  "/hide",
  bodyParser.json(),
  authenticateToken,
  postController.hidePost
);

router.delete(
  "/unhide",
  bodyParser.json(),
  authenticateToken,
  postController.unhidePost
);
router.patch(
  "/lockPost",
  bodyParser.json(),
  authenticateToken,
  postController.lockPost
);
router.patch(
  "/unlockPost",
  bodyParser.json(),
  authenticateToken,
  postController.unlockPost
);
router.patch(
  "/upvote",
  bodyParser.json(),
  authenticateToken,
  postController.upvote
);
router.patch(
  "/downvote",
  bodyParser.json(),
  authenticateToken,
  postController.downvote
);

router.get(
  "/comments",
  bodyParser.json(),
  authenticateToken,
  postController.getAllPostComments
);
router.patch(
  "/markAsNSFW",
  bodyParser.json(),
  authenticateToken,
  postController.markAsNSFW
);
router.patch(
  "/unmarkAsNSFW",
  bodyParser.json(),
  authenticateToken,
  postController.unmarkAsNSFW
);
router.patch(
  "/cancelDownvote",
  bodyParser.json(),
  authenticateToken,
  postController.cancelDownvote
);
router.patch(
  "/cancelUpvote",
  bodyParser.json(),
  authenticateToken,
  postController.cancelUpvote
);

router.patch(
  "/approvePost",
  bodyParser.json(),
  authenticateToken,
  postController.approvePost
);

router.patch(
  "/removePost",
  bodyParser.json(),
  authenticateToken,
  postController.removePost
);

router.patch(
  "/markAsSpoiler",
  bodyParser.json(),
  authenticateToken,
  postController.markAsSpoiler
);

router.patch(
  "/unmarkAsSpoiler",
  bodyParser.json(),
  authenticateToken,
  postController.unmarkAsSpoiler
);

router.patch(
  "/report",
  bodyParser.json(),
  authenticateToken,
  postController.reportPost
);
router.get(
  "/trending",
  bodyParser.json(),
  //authenticateToken,
  postController.getTrendingPosts
);
router.get(
  "/get",
  bodyParser.json(),
  authenticateToken,
  postController.getPostById
);
router.post(
  "/scheduledPost",
  bodyParser.json(),
  authenticateToken,
  uploadImage.array("file"),
  postController.scheduledPost
);

router.get(
  "/homepage/feed",
  bodyParser.json(),
  authenticateToken,
  postController.getAllPosts
);

router.get(
  "/searchPosts",
  bodyParser.json(), 
  authenticateToken,
  postController.searchPosts
);

router.get(
  "/subreddit/searchPosts",
  bodyParser.json(),
  authenticateToken,
  postController.subredditPostSearch
);
router.patch(
  "/votePoll",
  bodyParser.json(),
  authenticateToken,
  postController.addVoteToPoll
);
module.exports = router;
