const Comment = require("../models/comment");
const Post = require("../models/post");
const User = require("../models/user");
const SubReddit = require("../models/subReddit");

const hideComment = (req, res, next) => {
  const { commentId } = req.body;
  Comment.findById(commentId)
    .then((comment) => {
      if (!comment) {
        res.status(404).json({ message: "Comment not found" });
        return null;
      }
      if (comment.isHidden) {
        res.status(200).json({ message: "Comment is already hidden" });
        return null;
      }
      comment.isHidden = true;
      return comment.save();
    })
    .then((result) => {
      if (result) {
        res.status(200).json({ message: "Comment hidden successfully" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({ message: "Could not hide comment" });
    });
};
const unhideComment = (req, res, next) => {
  const { commentId } = req.body;
  Comment.findById(commentId)
    .then((comment) => {
      if (!comment) {
        res.status(404).json({ message: "Comment not found" });
        return null;
      }
      if (!comment.isHidden) {
        res.status(200).json({ message: "Comment is already visible" });
        return null;
      }
      comment.isHidden = false;
      return comment.save();
    })
    .then((result) => {
      if (result) {
        res.status(200).json({ message: "Comment unhidden successfully" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({ message: "Could not unhide comment" });
    });
};

const createComment = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      Post.findById(req.body.postId)
        .then((post) => {
          if (!post) {
            console.error("Post not found for post ID:", req.body.postId);
            return res.status(404).json({ message: "Post not found" });
          }
          if (post.subReddit === null) {
            if (post.isLocked && !post.user.equals(userId)) {
              console.error("Post is locked");
              return res.status(400).json({ message: "Post is locked" });
            }
          }
          if (post.subReddit !== null) {
            SubReddit.findById(post.subReddit)
              .then((subReddit) => {
                if (post.isLocked && !subReddit.moderators.includes(userId)) {
                  console.error("Post is locked");
                  return res.status(400).json({ message: "Post is locked" });
                }
              })
              .catch((err) => {
                return res.status(404).json({ message: "Subreddit not found" });
              });
          }
          const comment = new Comment({
            postId: req.body.postId,
            userId: userId,
            text: req.body.text,
            parentCommentId: req.body.parentCommentId,
            replies: [],
            votes: 0,
            isHidden: req.body.isHidden,
          });
          comment
            .save()
            .then((savedComment) => {
              if (req.body.parentCommentId != null) {
                Comment.findById(req.body.parentCommentId)
                  .then((parentComment) => {
                    if (!parentComment) {
                      console.error(
                        "Parent Comment not found for comment ID:",
                        req.body.parentCommentId
                      );
                      return res
                        .status(404)
                        .json({ message: "Parent Comment not found" });
                    }
                    parentComment.replies.push(savedComment);
                    parentComment
                      .save()
                      .then(() => {
                        post.comments.push(savedComment._id);
                        post.commentCount += 1;
                        post
                          .save()
                          .then(() => {
                            user.comments.push(savedComment._id);
                            user
                              .save()
                              .then(() => {
                                res.json({
                                  message: "Comment Created successfully",
                                  savedComment,
                                });
                              })
                              .catch((err) => {
                                console.error(err);
                                return res
                                  .status(400)
                                  .json("Could not attach comment to the user");
                              });
                          })
                          .catch((err) => {
                            console.error(err);
                            return res
                              .status(400)
                              .json("Could not attach comment to the post");
                          });
                      })
                      .catch((err) => {
                        console.error(err);
                        return res
                          .status(400)
                          .json(
                            "Could not attach comment to the parent comment"
                          );
                      });
                  })
                  .catch((err) => {
                    console.error("Error retrieving parent comment:", err);
                    res.status(500).json({
                      message: "Error Retrieving Parent Comment",
                      error: err,
                    });
                  });
              } else {
                post.comments.push(savedComment._id);
                post.commentCount += 1;
                post
                  .save()
                  .then(() => {
                    user.comments.push(savedComment._id);
                    user
                      .save()
                      .then(() => {
                        res.json({
                          message: "Comment Created successfully",
                          savedComment,
                        });
                      })
                      .catch((err) => {
                        console.error(err);
                        return res.status(400).json({
                          message: "Could not attach comment to the user",
                          error: err,
                        });
                      });
                  })
                  .catch((err) => {
                    console.error(err);
                    return res.status(400).json({
                      message: "Could not attach comment to the post",
                      error: err,
                    });
                  });
              }
            })
            .catch((err) => {
              console.error("Error Creating Comment:", err);
              res
                .status(500)
                .json({ message: "Error Creating Comment", error: err });
            });
        })
        .catch((err) => {
          console.error("Error retrieving post:", err);
          res
            .status(500)
            .json({ message: "Error Retrieving Post", error: err });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Error Retrieving User", error: err });
    });
};

module.exports = {
  hideComment,
  unhideComment,
  createComment,
};
