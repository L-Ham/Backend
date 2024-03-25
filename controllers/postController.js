const Post = require("../models/post");
const User = require("../models/user");

const savePost = (req, res, next) => {
    const userId = req.userId;

    User.findById(userId)
        .then((user) => {
            if (!user) {
                console.error("User not found for user ID:", userId);
                return res.status(404).json({ message: "User not found" });
            }

            //const post = new Post(req.body.Post);
            user.savedPost.push(req.body.Post);

            user.save()
                .then(() => {
                    res.status(200).json({ message: "Post saved successfully" });
                })
                .catch((error) => {
                    console.error("Error saving post:", error);
                    res.status(500).json({ message: "Error saving post" });
                });
        })
        .catch((error) => {
            console.error("Error finding user:", error);
            res.status(500).json({ message: "Error finding user" });
        });
};
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
    savePost,
    downvote,
    upvote
};
