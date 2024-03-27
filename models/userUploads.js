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
  url: String
});

const UserUpload = mongoose.model('userUploads', userUploadSchema);

module.exports = UserUpload;
