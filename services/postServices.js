const UserUploadModel = require("../models/userUploads");
async function getImagesUrls(images) {
  const urls = await Promise.all(
    images.map(async (image) => {
      const imageUrl = await UserUploadModel.findById(image).select("url");
      return imageUrl.url;
    })
  );
  return urls;
}
async function getVideosUrls(videos) {
  const urls = await Promise.all(
    videos.map(async (video) => {
      const videoUrl = await UserUploadModel.findById(video).select("url");
      return videoUrl.url;
    })
  );
  return urls;
}

module.exports = {
  getImagesUrls,
  getVideosUrls,
};
