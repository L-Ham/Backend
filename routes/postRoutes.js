const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");

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

module.exports = router;