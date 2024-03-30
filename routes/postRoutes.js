const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");
const { auth } = require("google-auth-library");
const { uploadImage  } = require("../middleware/multerConfig");


router.post(
  "/createPost",
  bodyParser.json(),
  authenticateToken,
  uploadImage.array('file'),
  postController.createPost
);
router.patch(
  "/editPost",
  bodyParser.json(),
  authenticateToken,
  postController.editPost
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
  "/getAllPostComments",
  bodyParser.json(),
  authenticateToken,
  postController.getAllPostComments
);
router.patch(
  "markAsNSFW",
  bodyParser.json(),
  authenticateToken,
  postController.markAsNSFW
);
module.exports = router;
