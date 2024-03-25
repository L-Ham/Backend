const Post = require("../models/post");
const createPost = async (req, res, next) => {};

const upvote = async (req, res, next) => {
  const userId = req.userId;
  const postId = req.body.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (post.upvotedUsers.includes(userId)) {
        return res.status(400).json({ message: "Post already upvoted" });
      }
      post.upvotes += 1;
      post.upvotedUsers.push(req.userId);
      post.save();
      User.findById(userId)
        .then((user) => {
          user.upvotedPosts.push(postId);
          user.save();
          res.status(200).json({ message: "Post upvoted & added to user" });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ message: "Error finding user", error: err });
        });
    })
    .catch((err) => {
      res.status(400).json({ message: "Error finding post", error: err });
    });
};

const downvote = async (req, res, next) => {
  const userId = req.userId;
  const postId = req.body.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (post.downvotedUsers.includes(userId)) {
        return res.status(400).json({ message: "Post already downvoted" });
      }
      post.downvotes += 1;
      post.downvotedUsers.push(req.body.userId);
      post.save();
      User.findById(userId)
        .then((user) => {
          user.downvotedPosts.push(postId);
          user.save();
          res.status(200).json({ message: "Post downvoted & added to user" });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ message: "Error finding user", error: err });
        });
    })
    .catch((err) => {
      res.status(400).json({ message: "Error finding post", error: err });
    });
};

module.exports = {
  createPost,
  upvote,
  downvote,
};
