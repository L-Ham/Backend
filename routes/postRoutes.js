const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");

router.post(
    "/createPost",
    bodyParser.json(),
    authenticateToken,
    postController.createPost
  );

router.patch(
    "/save",
    bodyParser.json(),
    authenticateToken,
    postController.savePost
  );

module.exports = router;