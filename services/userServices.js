const Post = require("../models/post");

const paginateResults = async (query, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const results = {};
  const items = await query.exec();
  if (endIndex < items.length) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }
  results.slicedArray = items.slice(startIndex, endIndex);
  return results;
};

module.exports = { paginateResults };
