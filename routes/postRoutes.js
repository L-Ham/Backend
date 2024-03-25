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

router.delete(
    "/unsave",
    bodyParser.json(),
    authenticateToken,
    postController.unsavePost
  );

module.exports = router;