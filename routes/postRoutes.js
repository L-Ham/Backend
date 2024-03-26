const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");
const { auth } = require("google-auth-library");

router.post(
    "/createPost",
    bodyParser.json(),
    authenticateToken,
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
  router.patch(
    "/upvote",
    bodyParser.json(),
    authenticateToken,
    postController.upvote
  );
  router.post(
    "/downvote",
    bodyParser.json(),
    authenticateToken,
    postController.downvote
  );
router.patch(
  "/lockPost",
  authenticateToken,
  postController.lockPost
)
router.patch(
  "/unlockPost",
  authenticateToken,
  postController.unlockPost
)
module.exports = router;