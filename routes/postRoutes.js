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
  authenticateToken,
  postController.lockPost
)
router.patch(
  "/unlockPost",
  authenticateToken,
  postController.unlockPost
)
module.exports = router;