const Comment = require("../models/comment");
const Post = require("../models/post");
const User = require("../models/user");
const SubReddit = require("../models/subReddit");
const UserUpload = require("../controllers/userUploadsController");
const Report = require("../models/report");

const createComment = async (req, res, next) => {
  const userId = req.userId;
  const postId = req.body.postId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      console.log("Post not found for post ID:", postId);
      return res.status(404).json({ message: "Post not found" });
    }

    // Check post lock
    if (
      post.isLocked &&
      !user.isAdmin &&
      post.user.toString() !== userId &&
      !post.moderators.includes(userId)
    ) {
      return res.status(400).json({ message: "Post is Already locked" });
    }

    if (
      (!req.body.text || req.body.text.trim() === "") &&
      (!req.files || req.files.length === 0) &&
      !req.body.url
    ) {
      console.log("Comment text, file, or url is required");
      return res
        .status(400)
        .json({ message: "Comment text, file, or url is required" });
    }

    const comment = new Comment({
      postId: req.body.postId,
      userId: userId,
      text: req.body.text.trim() || " ",
      parentCommentId: req.body.parentCommentId || null,
      replies: [],
      votes: 0,
      isHidden: req.body.isHidden || false,
    });

    if (req.files && req.files.length > 0) {
      // Multer changed, use req.file now
      const commentfile = req.files[0];
      if (req.body.type === "image") {
        const uploadedImageId = await UserUpload.uploadMedia(commentfile);
        comment.images.push(uploadedImageId);
      } else if (req.body.type === "video") {
        const uploadedVideoId = await UserUpload.uploadMedia(commentfile);
        comment.videos.push(uploadedVideoId);
      } else {
        return res.status(400).json({ message: "Failed to upload media" });
      }
    }

    if (req.body.url) {
      comment.url = req.body.url;
    }

    const savedComment = await comment.save();

    if (req.body.parentCommentId) {
      const parentComment = await Comment.findById(req.body.parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent Comment not found" });
      }

      parentComment.replies.push(savedComment._id);
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
    res.status(500).json({ message: "Error Creating Comment", error: err.message });
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

const cancelDownvote = async (req, res, next) => {
  try {
    const userId = req.userId;
    const commentId = req.body.commentId;
    const comment = await Comment.findById(commentId);
    const user = await User.findById(userId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (!comment.downvotedUsers.includes(userId)) {
      return res.status(400).json({ message: "Comment not downvoted" });
    }
    comment.downvotes -= 1;
    comment.downvotedUsers.pull(userId);
    await comment.save();
    if (user) {
      user.downvotedComments.pull(commentId);
      await user.save();
    }
    res.status(200).json({ message: "Downvote cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling downvote", error: err });
  }
};

const cancelUpvote = async (req, res, next) => {
  try {
    const userId = req.userId;
    const commentId = req.body.commentId;
    const comment = await Comment.findById(commentId);
    const user = await User.findById(userId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (!comment.upvotedUsers.includes(userId)) {
      return res.status(400).json({ message: "Comment not upvoted" });
    }
    comment.upvotes -= 1;
    comment.upvotedUsers.pull(userId);
    await comment.save();
    if (user) {
      user.upvotedComments.pull(commentId);

      await user.save();
    }
    res.status(200).json({ message: "Upvote cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling upvote", error: err });
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
    if (
      user.blockUsers.some((blockedUser) =>
        blockedUser.blockedUserId.equals(commentOwner._id)
      )
    ) {
      return res
        .status(400)
        .json({ message: "You have already blocked this user" });
    }

    const post = await Post.findById(comment.postId);
    if (!post) {
      console.log("Post not found for post ID:", comment.postId);
      return res.status(404).json({ message: "Post not found" });
    }
    if (title === "") {
      return res.status(400).json({ message: "Title is required" });
    }
    if (description === "") {
      return res.status(400).json({ message: "Description is required" });
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

    if (req.body.blockUser) {
      user.blockUsers.push({
        blockedUserId: commentOwner._id,
        blockedUserName: commentOwner.userName,
        blockedUserAvatar: commentOwner.avatarImage,
        blockedAt: new Date(),
      });
      //user.blockUsers.push(commentOwner._id);
      await user.save();
    }
    await report.save();
    res.status(200).json({ message: "Comment reported successfully" });
  } catch (err) {
    console.log("Error reporting Comment:", err);
    res.status(500).json({ message: "Error reporting Comment", error: err });
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
    if (comment.isLocked == true) {
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
    res
      .status(500)
      .json({ message: "Error locking comment", error: err.message });
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
    if (comment.isLocked == false) {
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
    res
      .status(500)
      .json({ message: "Error unlocking comment", error: err.message });
  }
};
module.exports = {
  createComment,
  upvote,
  downvote,
  reportComment,
  lockComment,
  unlockComment,
  cancelDownvote,
  cancelUpvote,
};
