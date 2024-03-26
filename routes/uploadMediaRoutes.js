const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const bodyParser = require("body-parser");
const userUploadsController = require("../controllers/userUploadsController");
const { uploadImage , uploadVideo } = require("../middleware/multerConfig");

router.post(
  "/image",
  uploadImage.single('file'),
  bodyParser.json(),
  authenticateToken,
  userUploadsController.uploadImage
);
router.post(
  "/videos",
  uploadVideo.single('file'),
  bodyParser.json(),
  authenticateToken,
  userUploadsController.uploadVideo
);

module.exports = router;