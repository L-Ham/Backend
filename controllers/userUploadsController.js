const UserUpload = require("../models/userUploads");
const User = require("../models/user");
const Post = require("../models/post");
const cloudinary = require("../middleware/cloudinary");
const { use } = require("moongose/routes");

async function uploadMedia(file) {
  const b64 = Buffer.from(file.buffer).toString('base64')
  const dataURI = 'data:' + file.mimetype + ';base64,' + b64
  console.log("dataURI",dataURI)
  const {secure_url} = await cloudinary.uploader.upload(
    dataURI,
    {resource_type: "auto"}
  );
console.log("secure_url",secure_url)
  try {
    const newUserUpload = await UserUpload.create({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      url: secure_url,
    });
    console.log("Media uploaded successfully:", newUserUpload);

    return newUserUpload._id;
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
}
async function destroyMedia(mediaId) {
 
  try {
    const media = await userUploads
      .findById(mediaId);

    const urls=media.url.split("/")
    console.log("media",media)
    await cloudinary.api.delete_resources(urls[urls.length-1]);
    await media.remove();
    console.log("Media deleted successfully");
  }
  catch (error) {
    console.error("Error deleting media:", error);
    res.status(500).json({ error: "Failed to delete media" });
  }
}

module.exports = {
  uploadMedia,
  destroyMedia
};
