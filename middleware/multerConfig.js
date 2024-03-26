const express = require("express");
const multer = require("multer");
const path = require("path");
const userUploadsController = require('../controllers/userUploadsController');

const router = express.Router();

const storage = (destination) => multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, destination);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadImage = multer({ storage: storage("./uploads/images/") });
const uploadVideo = multer({ storage: storage("./uploads/videos/") });

router.post("/image", uploadImage.array("file"), (req, res) => {
  res.json({
    message: "Image uploaded successfully",
    filenames: req.files.map((file) => file.filename),
  });
});

router.post("/video", uploadVideo.array("file"), (req, res) => {
  res.json({
    message: "Video uploaded successfully",
    filenames: req.files.map((file) => file.filename),
  });
});

router.post('/image', uploadImage.single('file'), userUploadsController.uploadImage);

module.exports = { router, uploadImage, uploadVideo };