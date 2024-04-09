const Comment = require("../models/comment");
const Post = require("../models/post");
const User = require("../models/user");
const SubReddit = require("../models/subReddit");
const Report = require("../models/report");

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

const reportComment = async (req, res, next) => {
  const userId = req.userId;
  const commentId = req.body.commentId;
  const title = req.body.title;
  const description = req.body.description;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      console.log("Comment not found for comment ID:", commentId);
      return res.status(404).json({ message: "Comment not found" });
    }

    const commentOwner = await User.findById(comment.userId);
    if (!commentOwner) {
      return res.status(404).json({ message: "Comment owner not found" });
    }
    if(user.blockUsers.includes(commentOwner._id)){
      return res.status(400).json({ message: "You have already blocked this user" });
    }

    const post = await Post.findById(comment.postId);
    if (!post) {
      console.log("Post not found for post ID:", comment.postId);
      return res.status(404).json({ message: "Post not found" });
    }
    const subRedditId = post.subReddit;
    //const subRedditId = comment.post.subReddit;
    const report = new Report({
      type: "comment",
      referenceId: commentId,
      reporterId: userId,
      reportedId: commentOwner._id,
      subredditId: subRedditId || null,
      title: title || "",
      description: description,
      blockUser: req.body.blockUser || false,
    });

    if (req.body.blockUser){
      user.blockUsers.push(commentOwner._id);
      await user.save();
    }
    await report.save();
    res.status(200).json({ message: "Comment reported successfully" });

  }
  catch (err) {
    console.error("Error reporting Comment:", err);
    res.status(500).json({ message: "Error reporting Comment", error: err });
  }
} 


module.exports = {
  createComment,
  upvote,
  downvote,
  reportComment,
};
