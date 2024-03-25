const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authenticateToken = require("../middleware/authenticateToken");
const bodyParser = require("body-parser");

router.patch(
    "/hideComment",
    bodyParser.json(),
    authenticateToken,
    commentController.hideComment  
);
router.patch(
    "/unhideComment",
    bodyParser.json(),
    authenticateToken,
    commentController.unhideComment  
);

module.exports = router;
