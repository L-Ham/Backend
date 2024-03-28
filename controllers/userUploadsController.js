const UserUpload = require('../models/userUploads'); 
const User = require('../models/user');
const Post = require('../models/post');

async function uploadImage(req, res) {
  const userId = req.userId;
  const postId = req.body.postId; 
  console.log('postId from body:', postId);

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    const newUserUpload = await UserUpload.create({
      userId: user._id,
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      url: `/uploads/images/${req.file.filename}`,
      type: req.body.type,
    });
    console.log('Image uploaded successfully:', newUserUpload);
    if (req.body.type === 'post') {
      const post = await Post.findById(postId);
      if (!post) {
        console.error("Post not found for post ID:", postId);
        return res.status(404).json({ message: "Post not found" });
      }

      post.images.push(newUserUpload._id);

      await post.save();
      console.log('Image added to post successfully:', post);
    }

    res.json({
      message: 'Image uploaded successfully',
      userUpload: newUserUpload
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}
async function uploadVideo(req, res) {
    const userId = req.userId;
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create a new document in the userUploads collection for the uploaded video
      const newVideoUpload = await UserUpload.create({
        userId: user._id,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        url: `/uploads/videos/${req.file.filename}`,
      });
      console.log('Video uploaded successfully:', newVideoUpload);
  
      // Return success response with the newly created userUpload
      res.json({
        message: 'Video uploaded successfully',
        userUpload: newVideoUpload
      });
    } catch (error) {
      // Handle errors
      console.error('Error uploading video:', error);
      res.status(500).json({ error: 'Failed to upload video' });
    }
  }
  

module.exports = {
  uploadImage,
  uploadVideo
};
