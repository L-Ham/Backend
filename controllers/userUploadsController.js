const UserUpload = require("../models/userUploads");
const User = require("../models/user");
const Post = require("../models/post");
const cloudinary = require("../middleware/cloudinary");
const { use } = require("moongose/routes");

async function uploadMedia(file) {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataURI = "data:" + file.mimetype + ";base64," + b64;
  console.log("dataURI", dataURI);
  const { secure_url } = await cloudinary.uploader.upload(dataURI, {
    resource_type: "auto",
  });
  try {
    const newUserUpload = await UserUpload.create({
      originalname: file.originalname,
      mimetype: file.mimetype,
      url: secure_url,
    });
    console.log("Media uploaded successfully:", newUserUpload);

    return newUserUpload._id;
  } catch (error) {
    res.status(500).json({ error: "Failed to upload image" });
  }
}
async function destroyMedia(mediaId) {
  try {
    const media = await UserUpload.findById(mediaId);
    const urls = media.url.split("/");
   
    let publicId = urls[urls.length - 1];
    publicId = publicId.substring(0, publicId.lastIndexOf("."));
    await cloudinary.api.delete_resources([publicId]);
    await UserUpload.findByIdAndDelete(mediaId);

  } catch (error) {
    res.status(500).json({ error: "Failed to delete media" });
  }
  console.log("Media deleted successfully");
}

module.exports = {
  uploadMedia,
  destroyMedia,
};
