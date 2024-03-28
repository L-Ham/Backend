const Comment = require("../models/comment");
const Post = require("../models/post");
const User = require("../models/user");
const SubReddit = require("../models/subReddit");

const createComment = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(req.body.postId);
    if (!post) {
      console.error("Post not found for post ID:", req.body.postId);
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.subReddit === null) {
      if (post.isLocked && !post.user.equals(userId)) {
        console.error("Post is locked");
        return res.status(400).json({ message: "Post is locked" });
      }
    } else {
      const subReddit = await SubReddit.findById(post.subReddit);
      if (post.isLocked && !subReddit.moderators.includes(userId)) {
        console.error("Post is locked");
        return res.status(400).json({ message: "Post is locked" });
      }
    }

    if (req.body.text == null || req.body.text === "") {
      console.error("Comment text is required");
      return res.status(400).json({ message: "Comment text is required" });
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

    const savedComment = await comment.save();

    if (req.body.parentCommentId !== null) {
      const parentComment = await Comment.findById(req.body.parentCommentId);
      if (!parentComment) {
        console.error(
          "Parent Comment not found for comment ID:",
          req.body.parentCommentId
        );
        return res.status(404).json({ message: "Parent Comment not found" });
      }

      if (!parentComment.replies) {
        parentComment.replies = [];
      }

      parentComment.replies.push(savedComment);
      await parentComment.save();
    }

    post.comments.push(savedComment._id);
    post.commentCount += 1;
    await post.save();

    user.comments.push(savedComment._id);
    await user.save();

    res.json({
      message: "Comment Created successfully",
      savedComment,
    });
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ message: "Error Creating Comment", error: err });
  }
};

module.exports = {
  createComment,
};
