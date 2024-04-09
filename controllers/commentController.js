const Comment = require("../models/comment");
const Post = require("../models/post");
const User = require("../models/user");
const SubReddit = require("../models/subReddit");

const createComment = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(req.body.postId);
    if (!post) {
      console.log("Post not found for post ID:", req.body.postId);
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.subReddit === null) {
      if (post.isLocked && !post.user.equals(userId)) {
        console.log("Post is locked");
        return res.status(400).json({ message: "Post is locked" });
      }
    } else {
      const subReddit = await SubReddit.findById(post.subReddit);
      if (post.isLocked && !subReddit.moderators.includes(userId)) {
        console.log("Post is locked");
        return res.status(400).json({ message: "Post is locked" });
      }
    }

    if (req.body.text == null || req.body.text === "") {
      console.log("Comment text is required");
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
    console.log("Error creating comment:", err);
    res.status(500).json({ message: "Error Creating Comment", error: err });
  }
};
const upvote = async (req, res, next) => {
  try {
    const userId = req.userId;
    const commentId = req.body.commentId;
    const comment = await Comment.findById(commentId);
    const user = await User.findById(userId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.upvotedUsers.includes(userId)) {
      return res.status(400).json({ message: "Comment already upvoted" });
    }
    if (comment.downvotedUsers.includes(userId)) {
      comment.downvotes -= 1;
      comment.downvotedUsers.pull(userId);
      user.downvotedComments.pull(commentId);
    }
    comment.upvotes += 1;
    comment.upvotedUsers.push(userId);
    await comment.save();
    if (user) {
      user.upvotedComments.push(commentId);
      await user.save();
    }
    res.status(200).json({ message: "Comment upvoted & added to user" });
  } catch (err) {
    res.status(500).json({ message: "Error upvoting Comment", error: err });
  }
};

const downvote = async (req, res, next) => {
  try {
    const userId = req.userId;
    const commentId = req.body.commentId;
    const comment = await Comment.findById(commentId);
    const user = await User.findById(userId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.downvotedUsers.includes(userId)) {
      return res.status(400).json({ message: "Comment already downvoted" });
    }
    if (comment.upvotedUsers.includes(userId)) {
      comment.upvotes -= 1;
      comment.upvotedUsers.pull(userId);
      user.upvotedComments.pull(commentId);
    }
    comment.downvotes += 1;
    comment.downvotedUsers.push(userId);
    await comment.save();
    if (user) {
      user.downvotedComments.push(commentId);
      await user.save();
    }
    res.status(200).json({ message: "Comment downvoted & added to user" });
  } catch (err) {
    res.status(500).json({ message: "Error downvoting comment", error: err });
  }
};

const lockComment = async (req, res, next) => {
  try {
    const userId = req.userId;
    const commentId = req.body.commentId;
    const comment = await Comment.findById(commentId);
    const user = await User.findById(userId);
    
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if(comment.isLocked==true)
    {
      return res.status(400).json({ message: "Comment is already locked" });
    }
    const post = await Post.findById(comment.postId);
    if (post.subReddit === null) {
      return res.status(400).json({
        message: "This feature is only available for subreddit moderators",
      });
    }
    const subReddit = await SubReddit.findById(post.subReddit);
    if (!subReddit.moderators.includes(userId)) {
      return res.status(400).json({
        message: "This feature is only available for subreddit moderators",
      });
    }
    
    comment.isLocked = true;
    await comment.save();
    res.status(200).json({ message: "Comment locked" });
  } catch (err) {
    console.error("Error locking comment:", err);
    res.status(500).json({ message: "Error locking comment", error: err });
  }
};

const unlockComment = async (req, res, next) => {
  try {
    const userId = req.userId;
    const commentId = req.body.commentId;
    const comment = await Comment.findById(commentId);
    const user = await User.findById(userId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if(comment.isLocked==false)
    {
      return res.status(400).json({ message: "Comment is already unlocked" });
    }
    const post = await Post.findById(comment.postId);
    if (post.subReddit === null) {
      return res.status(400).json({
        message: "This feature is only available for subreddit moderators",
      });
    }
    const subReddit = await SubReddit.findById(post.subReddit);
    if (!subReddit.moderators.includes(userId)) {
      return res.status(400).json({
        message: "This feature is only available for subreddit moderators",
      });
    }
   
    comment.isLocked = false;
    await comment.save();
    res.status(200).json({ message: "Comment unlocked" });
  } catch (err) {
    console.error("Error unlocking comment:", err);
    res.status(500).json({ message: "Error unlocking comment", error: err });
  }
};
module.exports = {
  createComment,
  upvote,
  downvote,
  lockComment,
  unlockComment,
};
