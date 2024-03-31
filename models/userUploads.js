const mongoose = require('mongoose');

const userUploadSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  mimetype: String,
  url: String,
  
});

const UserUpload = mongoose.model('userUploads', userUploadSchema);

module.exports = UserUpload;
