const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const bodyParser = require("body-parser");
const userUploadsController = require("../controllers/userUploadsController");
const { uploadImage } = require("../middleware/multerConfig");

router.post(
  "/image",
  uploadImage.single('file'),
  bodyParser.json(),
  authenticateToken,
  userUploadsController.uploadImage
);

module.exports = router;