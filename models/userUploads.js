const mongoose = require('mongoose');

const userUploadSchema = new mongoose.Schema({
  originalname: String,
  mimetype: String,
  url: String,
  
});

const UserUpload = mongoose.model('userUploads', userUploadSchema);

module.exports = UserUpload;
