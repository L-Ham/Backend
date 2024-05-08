const Comment = require("../models/comment");
const Post = require("../models/post");
const User = require("../models/user");
const SubReddit = require("../models/subReddit");
const UserUpload = require("../controllers/userUploadsController");
const UserUploadModel = require("../models/userUploads");
const Report = require("../models/report");
const NotificationServices = require("../services/notification");
const { format } = require("path");

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
    const subReddit = await SubReddit.findById(post.subReddit);
    if (subReddit && subReddit.privacy === "private") {
      if (!subReddit.members.includes(userId)) {
        return res
          .status(400)
          .json({ message: "You are not a member of this subreddit" });
      }
    }

    const isUserBanned = subReddit.bannedUsers.some(
      (bannedUser) => bannedUser.userId.toString() === userId.toString()
    );

    if (isUserBanned) {
      return res
        .status(400)
        .json({ message: "You are banned from this subreddit" });
    }

    if (subReddit !== null) {
      if (post.isLocked && !subReddit.moderators.includes(userId)) {
        return res
          .status(400)
          .json({ message: "Post is Already locked in the SubReddit" });
      }
    }

    if (
      post.isLocked &&
      post.user.toString() !== userId &&
      subReddit === null
    ) {
      console.log("Post is locked");
      return res.status(400).json({ message: "Post is locked" });
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
      const commentfile = req.files[0];
      if (req.body.type === "image" || req.body.type === "Image") {
        const uploadedImageId = await UserUpload.uploadMedia(commentfile);
        comment.images.push(uploadedImageId);
      } else if (req.body.type === "video" || req.body.type === "Video") {
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
    if (savedComment.parentCommentId) {
      console.log("ana reply");
      const parentComment = await Comment.findById(
        savedComment.parentCommentId
      );
      const replyReceiver = await User.findById(parentComment.userId);
      if (replyReceiver.notificationSettings.get("repliesToComments")) {
        await NotificationServices.sendNotification(
          replyReceiver.userName,
          user.userName,
          null,
          savedComment._id,
          "commentReply"
        );
        // res.status(200).json({
        //   message: "Comment Created successfully & Notification Sent",
        // });
      }
    }
    const receiver = await User.findById(post.user);
    if (receiver.notificationSettings.get("upvotesToPosts")) {
      await NotificationServices.sendNotification(
        receiver.userName,
        user.userName,
        post._id,
        savedComment._id,
        "commentedPost"
      );
      res
        .status(200)
        .json({ message: "Comment Created successfully & Notification Sent" });
    } else {
      res.status(200).json({
        message: "Comment Created successfully & Notification Not Required",
      });
    }

    // res.status(200).json({
    //   message: "Comment Created successfully",
    //   savedComment,
    // });
  } catch (err) {
    console.log("Error creating comment:", err);
    res
      .status(500)
      .json({ message: "Error Creating Comment", error: err.message });
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
const getReplies = async (req, res, next) => {
  try {
    const commentId = req.query.commentId;
    const comment = await Comment.findById(commentId).populate({
      path: "replies",
      populate: { path: "replies" },
    });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res
      .status(200)
      .json({ message: "Replies fetched", replies: comment.replies });
  } catch (err) {
    res.status(500).json({ message: "Error fetching replies", error: err });
  }
};

const commentSearch = async (req, res, next) => {
  const search = req.query.search;
  const relevance = req.query.relevance;
  const top = req.query.top;
  const newest = req.query.new;
  try {
    let query = {};
    if (search) {
      query.text = { $regex: search, $options: "i" };
    }
    let sort = {};
    if (relevance || top) {
      sort.upvotes = -1;
    }
    if (newest) {
      sort.createdAt = -1;
    }
    const populatedComments = await Comment.find(query)
      .sort(sort)
      .populate({
        path: "userId",
        model: "user",
      })
      .populate({
        path: "images",
        model: "userUploads",
      })
      .populate({
        path: "postId",
        model: "post",
      });
    const comments = await Promise.all(
      populatedComments.map(async (comment) => {
        const score = comment.upvotes - comment.downvotes;
        const subredditId = comment.postId.subReddit;
        let subreddittemp;
        let subredditAvatarId;
        let subredditAvatar;
        if (subredditId) {
          subreddittemp = await SubReddit.findById(subredditId);
          subredditAvatarId = subreddittemp.appearance.avatarImage;
          if (subredditAvatarId) {
            subredditAvatar = await UserUploadModel.findById(subredditAvatarId);
          }
        }
        let userAvatarId = comment.userId.avatarImage;
        let userAvatar;
        if (userAvatarId) {
          userAvatar = await UserUploadModel.findById(userAvatarId);
        }
        let subredditBanner = null;
        if (subredditId) {
          const bannerImageId = subreddittemp.appearance.bannerImage;
          subredditBanner = bannerImageId
            ? await UserUploadModel.findById(bannerImageId.toString())
            : null;
        }

        return {
          _id: comment._id,
          postId: comment.postId._id,
          userId: comment.userId._id,
          userName: comment.userId.userName,
          userAbout: comment.userId.profileSettings.get("about") || null,
          userAvatar: userAvatarId ? userAvatar.url : null,
          postCreatedAt: comment.postId.createdAt,
          postTitle: comment.postId.title,
          postText: comment.postId.text,
          postUpvotes: comment.postId.upvotes,
          postDownvotes: comment.postId.downvotes,
          postCommentCount: comment.postId.comments.length,
          score: score,
          subRedditName: subredditId ? subreddittemp.name : null,
          subRedditAvatar: subredditAvatarId ? subredditAvatar.url : null,
          subRedditBanner: subredditBanner ? subredditBanner.url : null,
          subRedditDescription: subredditId ? subreddittemp.description : null,
          subRedditMembers: subredditId ? subreddittemp.members.length : null,
          subRedditNickName: subredditId ? subreddittemp.membersNickname : null,
          subRedditCreatedAt: subredditId ? subreddittemp.createdAt : null,
          commentText: comment.text,
          commentImage: comment.images,
          commentUpvotes: comment.upvotes,
          commentDownvotes: comment.downvotes,
          commentCreatedAt: comment.createdAt,
        };
      })
    );
    res.status(200).json({ message: "Comments fetched", comments: comments });
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments", error: err });
  }
};

const subredditCommentSearch = async (req, res, next) => {
  const search = req.query.search;
  const relevance = req.query.relevance;
  const top = req.query.top;
  const newest = req.query.new;
  const subredditName = req.query.subredditName;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    const posts = await Post.find({ subReddit: subreddit._id.toString() });
    const postIds = posts.map((post) => post._id.toString());
    let query = { postId: { $in: postIds } };
    if (search) {
      query.text = { $regex: search, $options: "i" };
    }
    let sort = {};
    if (relevance || top) {
      sort.upvotes = -1;
    }
    if (newest) {
      sort.createdAt = -1;
    }
    const populatedComments = await Comment.find(query)
      .sort(sort)
      .populate({
        path: "userId",
        model: "user",
      })
      .populate({
        path: "images",
        model: "userUploads",
      })
      .populate({
        path: "postId",
        model: "post",
      });
    const comments = await Promise.all(
      populatedComments.map(async (comment) => {
        const score = comment.upvotes - comment.downvotes;
        const subredditId = comment.postId.subReddit;
        let subreddittemp;
        let subredditAvatarId;
        let subredditAvatar;
        if (subredditId) {
          subreddittemp = await SubReddit.findById(subredditId);
          subredditAvatarId = subreddittemp.appearance.avatarImage;
          if (subredditAvatarId) {
            subredditAvatar = await UserUploadModel.findById(subredditAvatarId);
          }
        }
        let subredditBanner = null;
        if (subredditId) {
          const bannerImageId = subreddittemp.appearance.bannerImage;
          subredditBanner = bannerImageId
            ? await UserUploadModel.findById(bannerImageId.toString())
            : null;
        }
        let userAvatarId = comment.userId.avatarImage;
        let userAvatar;
        if (userAvatarId) {
          userAvatar = await UserUploadModel.findById(userAvatarId);
        }

        return {
          _id: comment._id,
          postId: comment.postId._id,
          userId: comment.userId._id,
          userName: comment.userId.userName,
          userAbout: comment.userId.profileSettings.get("about") || null,
          userAvatar: userAvatarId ? userAvatar.url : null,
          postCreatedAt: comment.postId.createdAt,
          postTitle: comment.postId.title,
          postText: comment.postId.text,
          postUpvotes: comment.postId.upvotes,
          postDownvotes: comment.postId.downvotes,
          postCommentCount: comment.postId.comments.length,
          score: score,
          subRedditName: subredditId ? subreddittemp.name : null,
          subRedditAvatar: subredditAvatarId ? subredditAvatar.url : null,
          subRedditBanner: subredditBanner ? subredditBanner.url : null,
          subRedditDescription: subredditId ? subreddittemp.description : null,
          subRedditMembers: subredditId ? subreddittemp.members.length : null,
          subRedditNickName: subredditId ? subreddittemp.membersNickname : null,
          subRedditCreatedAt: subredditId ? subreddittemp.createdAt : null,
          commentText: comment.text,
          commentImage: comment.images,
          commentUpvotes: comment.upvotes,
          commentDownvotes: comment.downvotes,
          commentCreatedAt: comment.createdAt,
        };
      })
    );
    res.status(200).json({ message: "Comments fetched", comments: comments });
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments", error: err });
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
  getReplies,
  commentSearch,
  subredditCommentSearch,
};
