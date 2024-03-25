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

module.exports = router;