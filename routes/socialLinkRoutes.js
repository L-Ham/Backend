const express = require("express");
const router = express.Router();
const socialLinkController = require("../controllers/socialLinkController");
const authenticateToken = require("../middleware/authenticateToken");
const bodyParser = require("body-parser");

router.post(
  "/addSocialLink",
  bodyParser.json(),
  authenticateToken,
  socialLinkController.addSocialLink
);

module.exports = router;
