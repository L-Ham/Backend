const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();


const storage =  multer.memoryStorage();


const uploadImage = multer({ storage: storage });
const uploadVideo = multer({ storage: storage });

// router.post("/image", uploadImage.array("file"), (req, res) => {
//   res.json({
//     message: "Image uploaded successfully",
//     filenames: req.files.map((file) => file.filename),
//   });
// });

// router.post("/video", uploadVideo.array("file"), (req, res) => {
//   res.json({
//     message: "Video uploaded successfully",
//     filenames: req.files.map((file) => file.filename),
//   });
// });


module.exports = { router, uploadImage, uploadVideo };