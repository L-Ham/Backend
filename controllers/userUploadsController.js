const UserUpload = require('../models/userUploads'); 
const User = require('../models/user');

async function uploadImage(req, res) {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    // Create a new document in the userUploads collection for the uploaded image
    const newUserUpload = await UserUpload.create({
      userId: user._id,
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      url: `/uploads/images/${req.file.filename}`,
    });
    console.log('Image uploaded successfully:', newUserUpload);

    // Return success response with the newly created userUpload
    res.json({
      message: 'Image uploaded successfully',
      userUpload: newUserUpload
    });
  } catch (error) {
    // Handle errors
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}

module.exports = {
  uploadImage
};
