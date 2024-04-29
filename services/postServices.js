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


const paginatePosts = async (query, page, limit,sortMethod) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const results = {};
  const items = await query.exec();
  const sortedItems = sortPosts(items, sortMethod);
  if (endIndex < sortedItems.length) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    sortedItems.previous = {
      page: page - 1,
      limit: limit,
    };
  }
  sortedItems.slicedArray = items.slice(startIndex, endIndex);
  return sortedItems;
};

function sortPosts(posts, method) {
  let sortedPosts;
  if (method === 'Hot') {
    sortedPosts = posts.sort((a, b) => (b.upvotes-b.downvotes) - (a.upvotes-a.downvotes));
  } else if (method === 'New') {
    sortedPosts = posts.sort((a, b) => b.createdAt - a.createdAt);
  } else if (method === 'Top') {
    sortedPosts = posts.sort((a, b) => (b.upvotes-b.downvotes) + b.comments.length - ((a.upvotes-a.downvotes) + a.comments.length));
  } else if (method === 'Rising') {
    sortedPosts = posts.sort((a, b) => b.comments.length - a.comments.length);
  }
  return sortedPosts;
}

module.exports = {
  getImagesUrls,
  getVideosUrls,
  paginatePosts,
  sortPosts,
};
