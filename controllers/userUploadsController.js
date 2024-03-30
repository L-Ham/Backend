const UserUpload = require('../models/userUploads'); 
const User = require('../models/user');
const Post = require('../models/post');


async function uploadMedia(file) {
  
  try {
    const newUserUpload = await UserUpload.create({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      url: file.mimetype.startsWith('image/')? `/uploads/images/${file.filename}`: `/uploads/videos/${file.filename}`,
    });
    console.log('Media uploaded successfully:', newUserUpload);
  
    return newUserUpload._id;
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}



module.exports = {
  uploadMedia,
  
};
