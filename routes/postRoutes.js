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

router.patch(
    "/hide",
    bodyParser.json(),
    authenticateToken,
    postController.hidePost
);

module.exports = router;