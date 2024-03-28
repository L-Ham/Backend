const mongoose = require('mongoose');

const userUploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', 
    required: true
  },
  filename: String,
  originalname: String,
  mimetype: String,
  url: String,
  type: {
    type: String,
    enum: ['post', 'banner', 'profile', 'subReddit'], 
    required: true
  }
});

const UserUpload = mongoose.model('userUploads', userUploadSchema);

module.exports = UserUpload;
