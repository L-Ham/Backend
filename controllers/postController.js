const Post = require("../models/post");
const User = require("../models/user");
const SubReddit = require("../models/subReddit");
const Comment = require("../models/comment");
const UserUpload = require("../controllers/userUploadsController");
const Report = require("../models/report");
const mongoose = require("mongoose");
const UserUploadModel = require("../models/userUploads");
const schedule = require("node-schedule");
const PostServices = require("../services/postServices");
const NotificationServices = require("../services/notification");

const createPost = async (req, res, next) => {
  const userId = req.userId;
  const subRedditId = req.body.subRedditId;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (subRedditId) {
    const subReddit = await SubReddit.findById(subRedditId);
    if (
      subReddit.bannedUsers
        .map((user) => user.userId.toString())
        .includes(userId)
    ) {
      console.log("banned user");
      return res
        .status(403)
        .json({ message: "You are banned from this subreddit" });
    }
  }

  try {
    // Check if title is provided in the request body
    if (!req.body.title) {
      return res.status(400).json({ message: "Title is required" });
    }
    // Check type of post
    switch (req.body.type) {
      case "text":
        // For text posts, ensure no images, videos, or polls are provided
        if (
          (req.files && req.files.length > 0) ||
          req.body["poll.options"] ||
          req.body["poll.votingLength"] ||
          req.body["poll.startTime"] ||
          req.body["poll.endTime"] ||
          req.body.url
        ) {
          return res.status(400).json({
            message:
              "Text posts cannot include images, videos, links, or polls",
          });
        }
        break;
      case "image":
      case "video":
        if (
          req.body["poll.options"] ||
          req.body["poll.votingLength"] ||
          req.body["poll.startTime"] ||
          req.body.url
        ) {
          return res.status(400).json({
            message: "Image posts cannot include links or polls",
          });
        }
        // For image or video posts, ensure media is provided
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({
            message: "Media file is required for image or video post",
          });
        }
        break;
      case "poll":
        // For poll posts, ensure poll object is provided with at least two options
        if (req.body["poll.options"].length < 2) {
          return res.status(400).json({
            message:
              "Poll post must include a poll object with at least two options",
          });
        }
        break;
      case "link":
        // For link posts, ensure URL is provided
        if (
          (req.files && req.files.length > 0) ||
          req.body["poll.options"] ||
          req.body["poll.votingLength"] ||
          req.body["poll.startTime"] ||
          req.body["poll.endTime"]
        ) {
          return res.status(400).json({
            message: "Link posts cannot include media or polls",
          });
        }
        if (!req.body.url) {
          return res
            .status(400)
            .json({ message: "URL is required for link post" });
        }
        break;
      default:
        return res.status(400).json({ message: "Invalid post type" });
    }
    let subReddit = null;
    if (subRedditId != "") {
      subReddit = await SubReddit.findById(subRedditId);
      if (!subReddit) {
        console.error("Subreddit not found for subreddit ID:", subRedditId);
      }
    }
    const newPost = createNewPost(req, userId, subRedditId);
    if (req.files) {
      for (const media of req.files) {
        if (media.originalname) {
          const uploadedImageId = await UserUpload.uploadMedia(media);
          if (uploadedImageId && req.body.type === "image") {
            newPost.images.push(uploadedImageId);
          } else if (uploadedImageId && req.body.type === "video") {
            newPost.videos.push(uploadedImageId);
          } else {
            return res
              .status(400)
              .json({ message: "Failed to upload at least one media" });
          }
        } else {
          console.error("Media data missing in form data:", media);
        }
      }
    }
    if (subReddit) {
      subReddit.posts.push(newPost);
      await subReddit.save();
    } else {
      user.posts.push(newPost);
      await user.save();
    }
    await newPost.save();
    if (newPost.subReddit) {
      const subReddit = await SubReddit.findById(newPost.subReddit);
      console.log(subReddit.moderators[0]);
      console.log(user._id);
      if (user._id.toString() !== subReddit.moderators[0].toString()) {
        const receiver = await User.findById(subReddit.moderators[0]);
        console.log(receiver.notificationSettings.get("modNotifications"));
        if (receiver.notificationSettings.get("modNotifications")) {
          await NotificationServices.sendNotification(
            receiver.userName,
            user.userName,
            newPost._id,
            null,
            "postedInSubreddit"
          );
          res
            .status(200)
            .json({ message: "Post created successfully & Notification Sent" });
        } else {
          res.status(200).json({
            message: "Post created successfully & No Notification Required",
          });
        }
      } else {
        res.status(200).json({
          message: "Post created successfully & Notification Not Required",
        });
      }
    } else {
      res.status(200).json({
        message: "Post created successfully & No Notification Required",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
  }
};
function createNewPost(req, userId, subRedditId) {
  const pollOptions = req.body["poll.options"] || [];
  const votingLength = req.body["poll.votingLength"] || 0;
  const startTime = req.body["poll.startTime"] || null;
  const endTime = req.body["poll.endTime"] || null;
  const options = pollOptions.map((option) => ({
    option,
    voters: [],
  }));

  return new Post({
    user: userId,
    subReddit: subRedditId == "" ? null : subRedditId,
    title: req.body.title,
    text: req.body.text,
    images: req.body.images || [],
    videos: req.body.videos || [],
    url: req.body.url || "",
    type: req.body.type,
    isNSFW: req.body.isNSFW || false,
    isSpoiler: req.body.isSpoiler || false,
    isLocked: req.body.isLocked || false,
    upvotes: 1,
    downvotes: 0,
    views: 0,
    commentCount: 0,
    spamCount: 0,
    createdAt: new Date(),
    poll: {
      options: options,
      votingLength: votingLength,
      startTime: startTime,
      endTime: endTime,
    },
  });
}

const editPost = (req, res, next) => {
  const postId = req.body.postId;
  const userId = req.userId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.user.toString() !== userId) {
        return res
          .status(401)
          .json({ message: "User not authorized to edit post" });
      }
      if (post.type === "link") {
        return res.status(400).json({ message: "Url posts can't be edited" });
      }
      if (!post.text) {
        return res.status(400).json({ message: "Text posts can't be edited" });
      }
      if (!req.body.text) {
        return res
          .status(400)
          .json({ message: "Text field is required for editing" });
      }
      post.text = req.body.text;
      post.isEdited = true;
      post
        .save()
        .then(() => {
          res.status(200).json({ message: "Post updated successfully" });
        })
        .catch((error) => {
          res
            .status(500)
            .json({ message: "Error updating post", error: error.message });
        });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error finding post", error: error.message });
    });
};

const savePost = async (req, res, next) => {
  try {
    const userId = req.userId;
    const postId = req.body.postId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const savedPost = user.savedPosts.find((savedPost) =>
      savedPost.equals(postId)
    );
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    if (savedPost) {
      return res
        .status(400)
        .json({ message: "This post is already saved in your profile" });
    }
    user.savedPosts.push(postId);
    await user.save();
    res.status(200).json({ message: "Post saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving post" });
  }
};
const unsavePost = async (req, res, next) => {
  try {
    const userId = req.userId;
    const postId = req.body.postId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const savedPost = user.savedPosts.find((savedPost) =>
      savedPost.equals(postId)
    );
    if (!savedPost) {
      return res
        .status(404)
        .json({ message: "This post is not saved in your profile" });
    }
    user.savedPosts.pull(postId);
    await user.save();

    res.status(200).json({ message: "Post unsaved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error unsaving post" });
  }
};

const upvote = async (req, res, next) => {
  try {
    const userId = req.userId;
    const postId = req.body.postId;
    const post = await Post.findById(postId);
    const user = await User.findById(userId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.upvotedUsers.includes(userId)) {
      return res.status(400).json({ message: "Post already upvoted" });
    }
    if (post.downvotedUsers.includes(userId)) {
      post.downvotes -= 1;
      post.downvotedUsers.pull(userId);
      user.downvotedPosts.pull(postId);
    }
    post.upvotes += 1;
    post.upvotedUsers.push(userId);
    await post.save();
    if (user) {
      user.upvotedPosts.push(postId);
      await user.save();
    }
    const receiver = await User.findById(post.user);
    if (receiver.notificationSettings.get("upvotesToPosts")) {
      await NotificationServices.sendNotification(
        receiver.userName,
        user.userName,
        post._id,
        null,
        "upvotedPost"
      );
      res
        .status(200)
        .json({ message: "Post upvoted & added to user & Notification Sent" });
    } else {
      res.status(200).json({
        message: "Post upvoted & added to user & Notification Not Required",
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error upvoting post", error: err.message });
  }
};

const downvote = async (req, res, next) => {
  try {
    const userId = req.userId;
    const postId = req.body.postId;
    const post = await Post.findById(postId);
    const user = await User.findById(userId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.downvotedUsers.includes(userId)) {
      return res.status(400).json({ message: "Post already downvoted" });
    }
    if (post.upvotedUsers.includes(userId)) {
      post.upvotes -= 1;
      post.upvotedUsers.pull(userId);
      user.upvotedPosts.pull(postId);
    }
    post.downvotes += 1;
    post.downvotedUsers.push(userId);
    await post.save();
    if (user) {
      user.downvotedPosts.push(postId);
      await user.save();
    }
    const receiver = await User.findById(post.user);
    if (receiver.notificationSettings.get("upvotesToPosts")) {
      await NotificationServices.sendNotification(
        receiver.userName,
        user.userName,
        post._id,
        null,
        "downvotedPost"
      );
      res.status(200).json({
        message: "Post downvoted & added to user & Notification Sent",
      });
    } else {
      res.status(200).json({
        message: "Post downvoted & added to user & Notification Not Required",
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error downvoting post", error: err.message });
  }
};

const hidePost = async (req, res, next) => {
  const userId = req.userId;
  const postId = req.body.postId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    if (user.hidePosts.includes(req.body.postId)) {
      return res
        .status(500)
        .json({ message: "This post is already hidden in your profile" });
    }

    user.hidePosts.push(req.body.postId);
    await user.save();

    res.status(200).json({ message: "Post hidden successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error hidding post", error: error.message });
  }
};

const unhidePost = async (req, res, next) => {
  try {
    const userId = req.userId;
    const postId = req.body.postId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    const unhideIndex = user.hidePosts.findIndex((hidePost) =>
      hidePost._id.equals(postId)
    );

    if (unhideIndex === -1) {
      console.error(
        "This post is not hidden in your profile:",
        req.body.postId
      );
      return res
        .status(404)
        .json({ message: "This post is not hidden in your profile" });
    }

    user.hidePosts.pull(postId);

    await user.save();
    res.status(200).json({ message: "Post unhidden successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error unhidding post" });
  }
};

const lockPost = async (req, res, next) => {
  const postId = req.body.postId;
  const userId = req.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    console.log(post);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subReddit = await SubReddit.findById(post.subReddit);
    if (!subReddit) {
      return res.status(404).json({ message: "SubReddit not found" });
    }

    if (post.subReddit === null) {
      if (!post.user.equals(userId)) {
        return res
          .status(400)
          .json({ message: "User not authorized to lock post" });
      }
    }
    if (post.subReddit !== null) {
      console.log(subReddit.moderators.includes(userId));
      if (!subReddit.moderators.includes(userId)) {
        return res.status(400).json({
          message: "User not authorized to lock post in the subreddit",
        });
      }
    }
    if (post.isLocked === true) {
      return res.status(400).json({ message: "Post is already locked" });
    }
    post.isLocked = true;
    await post.save();

    res.status(200).json({ message: "Post locked successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error locking post", error: error.message });
  }
};
const unlockPost = async (req, res, next) => {
  const postId = req.body.postId;
  const userId = req.userId;

  try {
    if (!postId) {
      return res
        .status(400)
        .json({ message: "Missing postId in request body" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subReddit = await SubReddit.findById(post.subReddit);
    if (!subReddit) {
      console.error("SubReddit not found for ID:", post.subReddit);
      return res.status(404).json({ message: "SubReddit not found" });
    }

    if (post.subReddit === null) {
      if (!post.user.equals(userId)) {
        return res
          .status(400)
          .json({ message: "User not authorized to lock post" });
      }
    }

    if (post.subReddit !== null) {
      if (!subReddit.moderators.includes(userId)) {
        console.error(
          "User not authorized to lock post in the subreddit",
          post.subReddit.name
        );
        return res.status(400).json({
          message: "User not authorized to lock post in the subreddit",
        });
      }
    }
    if (post.isLocked === false) {
      return res.status(400).json({ message: "Post is already unlocked" });
    }
    post.isLocked = false;

    await post.save();

    res.status(200).json({ message: "Post unlocked successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error unlocking post", error: error.message });
  }
};
const getAllPostComments = async (req, res, next) => {
  const postId = req.query.postId;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const userId = req.userId ? req.userId : null;

  try {
    const post = await Post.findById(postId).populate({
      path: "comments",
      options: {
        skip: (page - 1) * limit,
        limit: limit,
      },
      populate: [
        {
          path: "replies",
          model: "comment",
          populate: {
            path: "replies",
            model: "comment",
          },
        },
        {
          path: "images",
          model: "userUploads",
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Promise.all(
      post.comments.map(async (comment) => {
        const score = comment.upvotes - comment.downvotes;
        const replies = await Promise.all(
          comment.replies.map(async (reply) => {
            const replyScore = reply.upvotes - reply.downvotes;
            let replyType = "text";
            let replyContent = reply.text;
            if (reply.images && reply.images.length > 0) {
              replyType = "image";
              replyContent = reply.images.map((image) => image.url);
              if (replyContent.length === 1) {
                replyContent = replyContent[0]; // If there's only one image, use it as a single URL
              }
            }
            const replyReplies = await Promise.all(
              reply.replies.map(async (reply2) => {
                const replyScore2 = reply2.upvotes - reply2.downvotes;
                let replyType2 = "text";
                let replyContent2 = reply2.text;
                if (reply2.images && reply2.images.length > 0) {
                  replyType2 = "image";
                  replyContent2 = reply2.images.map((image) => image.url);
                  if (replyContent2.length === 1) {
                    replyContent2 = replyContent2[0]; // If there's only one image, use it as a single URL
                  }
                }
                const userReply2 = await User.findById(reply2.userId);
                if (!userReply2) {
                  return res.status(404).json({ message: "User not found" });
                }

                let avatarImage = null;
                if (userReply2 && userReply2.avatarImage) {
                  let avatarImageId = userReply2.avatarImage;
                  avatarImage = avatarImageId
                    ? await UserUploadModel.findById(avatarImageId.toString())
                    : null;
                }

                return {
                  userId: reply2.userId,
                  userName: userReply2.userName,
                  userAvatarImage: avatarImage ? avatarImage.url : null,
                  commentId: reply2._id,
                  score: replyScore2,
                  isUpvoted: reply2.upvotes > 0,
                  isDownvoted: reply2.downvotes > 0,
                  repliedId: reply._id,
                  commentType: replyType2,
                  content: replyContent2,
                  text: reply2.text,
                  createdAt: reply2.createdAt,
                  replies: [],
                };
              })
            );

            const userComment1 = await User.findById(reply.userId);
            if (!userComment1) {
              return res.status(404).json({ message: "User not found" });
            }

            let avatarImagesub = null;
            if (userComment1 && userComment1.avatarImage) {
              let avatarImageIdsub = userComment1.avatarImage;
              avatarImagesub = avatarImageIdsub
                ? await UserUploadModel.findById(avatarImageIdsub.toString())
                : null;
            }

            return {
              userId: reply.userId,
              userName: userComment1.userName,
              userAvatarImage: avatarImagesub ? avatarImagesub.url : null,
              commentId: reply._id,
              score: replyScore,
              isUpvoted: reply.upvotes > 0,
              isDownvoted: reply.downvotes > 0,
              repliedId: comment._id,
              commentType: replyType,
              content: replyContent,
              text: reply.text,
              createdAt: reply.createdAt,
              replies: replyReplies,
            };
          })
        );

        let commentType = "text";
        let commentContent = comment.text;
        if (comment.images && comment.images.length > 0) {
          commentType = "image";
          commentContent = comment.images.map((image) => image.url);
          if (commentContent.length === 1) {
            commentContent = commentContent[0]; // If there's only one image, use it as a single URL
          }
        }

        const userComment = await User.findById(comment.userId);
        if (!userComment) {
          return res.status(404).json({ message: "User not found" });
        }

        let avatarImagemain = null;
        if (userComment && userComment.avatarImage) {
          let avatarImageIdmain = userComment.avatarImage;
          avatarImagemain = avatarImageIdmain
            ? await UserUploadModel.findById(avatarImageIdmain.toString())
            : null;
        }
        return {
          userId: comment.userId,
          userName: userComment.userName,
          userAvatar: avatarImagemain ? avatarImagemain.url : null,
          commentId: comment._id,
          score: score,
          isUpvoted: comment.upvotes > 0,
          isDownvoted: comment.downvotes > 0,
          repliedId: null,
          commentType: commentType,
          content: commentContent,
          text: comment.text,
          createdAt: comment.createdAt,
          replies: replies,
        };
      })
    );

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.historyPosts.push(post);
        await user.save();
      }
    }

    res.status(200).json({
      message: "Comments retrieved successfully",
      comments: comments,
    });
  } catch (error) {
    res.status(500).json({ message: "Error getting comments for post" });
  }
};

const markAsNSFW = async (req, res, next) => {
  const userId = req.userId;
  const postId = req.body.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.isNSFW) {
      return res
        .status(400)
        .json({ message: "Post is already marked as NSFW" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    if (post.subReddit) {
      const postSubreddit = await SubReddit.findById(post.subReddit);
      if (!postSubreddit.moderators.includes(userId)) {
        if(post.user.toString() === userId)
          {
            post.isNSFW = true;
            await post.save();
            res.status(200).json({ message: "Post marked as NSFW" });
          }
        return res
          .status(401)
          .json({ message: "User not authorized to mark post as NSFW" });
      }
    }
    post.isNSFW = true;
    await post.save();
    res.status(200).json({ message: "Post marked as NSFW" });
  } catch (error) {
    res.status(500).json({ message: "Error Marking post as NSFW" });
  }
};
const unmarkAsNSFW = async (req, res, next) => {
  const userId = req.userId;
  const postId = req.body.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (!post.isNSFW) {
      return res.status(400).json({ message: "Post is not marked as NSFW" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (post.subReddit) {
      const postSubreddit = await SubReddit.findById(post.subReddit);
      if (!postSubreddit.moderators.includes(userId)) {
        if(post.user.toString() === userId)
          {
            post.isNSFW = false;
            await post.save();
            res.status(200).json({ message: "Post unmarked as NSFW" });
          }
        return res
          .status(401)
          .json({ message: "User not authorized to unmark post as NSFW" });
      }
    }
    post.isNSFW = false;
    await post.save();
    res.status(200).json({ message: "Post unmarked as NSFW" });
  } catch (error) {
    res.status(500).json({ message: "Error Unmarking post as NSFW" });
  }
};

const cancelUpvote = async (req, res, next) => {
  try {
    const userId = req.userId;
    const postId = req.body.postId;
    const post = await Post.findById(postId);
    const user = await User.findById(userId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (!post.upvotedUsers.includes(userId)) {
      return res.status(400).json({ message: "Post not upvoted" });
    }
    post.upvotes -= 1;
    post.upvotedUsers.pull(userId);
    await post.save();
    if (user) {
      user.upvotedPosts.pull(postId);
      await user.save();
    }
    res.status(200).json({ message: "Post upvote cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling upvote", error: err });
  }
};

const cancelDownvote = async (req, res, next) => {
  try {
    const userId = req.userId;
    const postId = req.body.postId;
    const post = await Post.findById(postId);
    const user = await User.findById(userId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (!post.downvotedUsers.includes(userId)) {
      return res.status(400).json({ message: "Post not downvoted" });
    }
    post.downvotes -= 1;
    post.downvotedUsers.pull(userId);
    await post.save();
    if (user) {
      user.downvotedPosts.pull(postId);
      await user.save();
    }
    res.status(200).json({ message: "Post downvote cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling downvote", error: err });
  }
};

const approvePost = async (req, res, next) => {
  const postId = req.body.postId;
  const userId = req.userId;
  const type = req.body.type;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (post.approved) {
      return res.status(400).json({ message: "Post already approved" });
    }
    const subReddit = await SubReddit.findById(post.subReddit);
    if (!subReddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subReddit.moderators.includes(userId)) {
      return res
        .status(401)
        .json({ message: "User not authorized to approve post" });
    }
    if (type == "removed") {
      console.log(subReddit.removedPosts);
      subReddit.removedPosts.pull(postId);
      console.log(subReddit.removedPosts);

      subReddit.posts.push(postId);
    }
    if (type == "reported") {
      subReddit.reportedPosts.pull(postId);
    }
    await subReddit.save();
    post.approved = true;
    post.approvedBy = userId;
    post.disapproved = false;
    post.approvedAt = new Date();
    await post.save();
    res.status(200).json({ message: "Post approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error approving post" });
  }
};

const removePost = async (req, res, next) => {
  const postId = req.body.postId;
  const userId = req.userId;
  const type = req.body.type;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subReddit = await SubReddit.findById(post.subReddit);
    if (!subReddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subReddit.moderators.includes(userId)) {
      return res
        .status(401)
        .json({ message: "User not authorized to remove post" });
    }
    if (post.disapproved == true) {
      return res.status(400).json({ message: "Post already removed" });
    }

    if (type == "reported") {
      subReddit.reportedPosts.pull(postId);
    }
    post.disapproved = true;
    post.disapprovedBy = userId;
    post.approved = false;
    post.disapprovedAt = new Date();
    await post.save();
    subReddit.posts.pull(postId);
    subReddit.removedPosts.push(postId);
    await subReddit.save();
    res.status(200).json({ message: "Post removed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing post", error: error.message });
  }
};

const reportPost = async (req, res, next) => {
  const postId = req.body.postId;
  const userId = req.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findById(post.subReddit);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    subreddit.reportedPosts.push(postId);
    post.approved = false;
    await post.save();
    await subreddit.save();
    res.status(200).json({ message: "Post reported successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error reporting post" });
  }
};

const markAsSpoiler = async (req, res, next) => {
  const userId = req.userId;
  const postId = req.body.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.isSpoiler) {
      return res
        .status(400)
        .json({ message: "Post is already marked as spoiler" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    if (post.subReddit) {
      const postSubreddit = await SubReddit.findById(post.subReddit);
      if (!postSubreddit.moderators.includes(userId)) {
        if (post.user.toString() === userId) {
          post.isSpoiler = true;
          await post.save();
          res.status(200).json({ message: "Post marked as spoiler" });
        }
        return res
          .status(401)
          .json({ message: "User not authorized to mark post as spoiler" });
      }
    }


    post.isSpoiler = true;
    await post.save();
    res.status(200).json({ message: "Post marked as spoiler" });
  } catch (error) {
    res.status(500).json({ message: "Error Marking post as spoiler" });
  }
};

const unmarkAsSpoiler = async (req, res, next) => {
  const userId = req.userId;
  const postId = req.body.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (!post.isSpoiler) {
      return res.status(400).json({ message: "Post is not marked as spoiler" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    if (post.subReddit) {
      const postSubreddit = await SubReddit.findById(post.subReddit);
      if (!postSubreddit.moderators.includes(userId)) {
        if (post.user.toString() === userId) {
          post.isSpoiler = false;
          await post.save();
          res.status(200).json({ message: "Post unmarked as spoiler" });
        }
        return res
          .status(401)
          .json({ message: "User not authorized to unmark post as spoiler" });
      }
    }
      
    post.isSpoiler = false;
    await post.save();
    res.status(200).json({ message: "Post unmarked as spoiler" });
  } catch (error) {
    res.status(500).json({ message: "Error Unmarking post as spoiler" });
  }
};

const getTrendingPosts = async (req, res, next) => {
  try {
    const trendingPosts = await Post.find({
      subReddit: {
        $ne: null,
      },
      images: {
        $ne: [],
      },
    })
      .sort({ upvotes: -1 })
      .limit(6);

    const postImagesIds = trendingPosts.map((post) => post.images[0]);
    const subRedditIds = trendingPosts.map((post) => post.subReddit);

    const [Images, subReddits] = await Promise.all([
      UserUploadModel.find({ _id: { $in: postImagesIds } }),
      SubReddit.find({ _id: { $in: subRedditIds } }),
    ]);

    const formattedPosts = await Promise.all(
      trendingPosts.map(async (post) => {
        const Image = Images.find((image) => image._id.equals(post.images[0]));
        const subRedditTemp = subReddits.find((community) =>
          community._id.equals(post.subReddit)
        );

        let avatarImage = null;
        if (subRedditTemp) {
          const avatarImageId = subRedditTemp.appearance.avatarImage;
          avatarImage = avatarImageId
            ? await UserUploadModel.findById(avatarImageId.toString())
            : null;
        }

        return {
          postId: post._id,
          title: post.title,
          text: post.text,
          image: Image ? Image.url : null,
          subreddit: subRedditTemp ? subRedditTemp.name : null,
          subRedditId: subRedditTemp ? subRedditTemp._id : null,
          avatarImage: avatarImage ? avatarImage.url : null,
        };
      })
    );

    formattedPosts.sort(
      (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
    );

    res.json({
      message: "Retrieved Trending Posts Successfully",
      trendingPosts: formattedPosts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error processing trending posts",
      error: error.message,
    });
  }
};

const getPostById = async (req, res, next) => {
  const userId = req.userId;
  const postId = req.query.postId;
  try {
    const post = await Post.findById(postId).populate({
      path: "images",
      model: "userUploads",
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    let user;
    if (userId) {
      user = await User.findById(userId);
    }
    let subreddit = null;
    if (post.subReddit) {
      subreddit = await SubReddit.findById(post.subReddit);
    }
    let avatarImageSubReddit = null;
    if (post.subReddit) {
      const avatarImageId = subreddit.appearance.avatarImage;
      avatarImageSubReddit = avatarImageId
        ? await UserUploadModel.findById(avatarImageId.toString())
        : null;
    }
    const creator = await User.findById(post.user);
    const creatorAvatar = await UserUploadModel.findById(creator.avatarImage);
    const isUpvoted = !userId ? false : post.upvotedUsers.includes(user._id);
    const isDownvoted = !userId
      ? false
      : post.downvotedUsers.includes(user._id);
    const isSaved = !userId ? false : user.savedPosts.includes(post._id);
    const response = {
      message: "Post retrieved successfully",
      post: {
        ...post.toObject(),
        creatorName: creator.userName,
        creatorAvatar: creatorAvatar ? creatorAvatar.url : null,
        subRedditName: subreddit ? subreddit.name : null,
        subRedditAvatar: avatarImageSubReddit ? avatarImageSubReddit.url : null,
        isUpvoted: isUpvoted,
        isDownvoted: isDownvoted,
        isSaved: isSaved,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting post", error: error.message });
  }
};

const scheduledPost = async (req, res, next) => {
  const userId = req.userId;
  const subRedditId = req.body.subRedditId;
  const scheduledMinutes = req.body.scheduledMinutes;
  console.log(req.body.title);

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (subRedditId) {
    const subReddit = await SubReddit.findById(subRedditId);
    if (
      subReddit.bannedUsers
        .map((user) => user.userId.toString())
        .includes(userId)
    ) {
      console.log("banned user");
      return res
        .status(403)
        .json({ message: "You are banned from this subreddit" });
    }
  }
  try {
    // Check if title is provided in the request body
    if (!req.body.title) {
      return res.status(400).json({ message: "Title is required" });
    }
    // Check type of post
    switch (req.body.type) {
      case "text":
        // For text posts, ensure no images, videos, or polls are provided
        if (
          (req.files && req.files.length > 0) ||
          req.body["poll.options"] ||
          req.body["poll.votingLength"] ||
          req.body["poll.startTime"] ||
          req.body["poll.endTime"] ||
          req.body.url
        ) {
          return res.status(400).json({
            message:
              "Text posts cannot include images, videos, links, or polls",
          });
        }
        break;
      case "image":
      case "video":
        if (
          req.body["poll.options"] ||
          req.body["poll.votingLength"] ||
          req.body["poll.startTime"] ||
          req.body.url
        ) {
          return res.status(400).json({
            message: "Image posts cannot include links or polls",
          });
        }
        // For image or video posts, ensure media is provided
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({
            message: "Media file is required for image or video post",
          });
        }
        break;
      case "poll":
        // For poll posts, ensure poll object is provided with at least two options
        if (req.body["poll.options"].length < 2) {
          return res.status(400).json({
            message:
              "Poll post must include a poll object with at least two options",
          });
        }
        break;
      case "link":
        // For link posts, ensure URL is provided
        if (
          (req.files && req.files.length > 0) ||
          req.body["poll.options"] ||
          req.body["poll.votingLength"] ||
          req.body["poll.startTime"] ||
          req.body["poll.endTime"]
        ) {
          return res.status(400).json({
            message: "Link posts cannot include media or polls",
          });
        }
        if (!req.body.url) {
          return res
            .status(400)
            .json({ message: "URL is required for link post" });
        }
        break;
      default:
        return res.status(400).json({ message: "Invalid post type" });
    }
    let subReddit = null;
    if (subRedditId != "") {
      subReddit = await SubReddit.findById(subRedditId);
      if (!subReddit) {
        console.error("Subreddit not found for subreddit ID:", subRedditId);
      }
    }
    const newPost = createNewScheduledPost(
      req,
      userId,
      subRedditId,
      scheduledMinutes
    );
    if (req.files) {
      for (const media of req.files) {
        if (media.originalname) {
          const uploadedImageId = await UserUpload.uploadMedia(media);
          if (uploadedImageId && req.body.type === "image") {
            newPost.images.push(uploadedImageId);
          } else if (uploadedImageId && req.body.type === "video") {
            newPost.videos.push(uploadedImageId);
          } else {
            return res
              .status(400)
              .json({ message: "Failed to upload at least one media" });
          }
        } else {
          console.error("Media data missing in form data:", media);
        }
      }
    }

    const postToSave = { ...newPost._doc };

    delete postToSave._id;

    const scheduleExpression = `*/${scheduledMinutes} * * * *`;
    schedule.scheduleJob(scheduleExpression, async () => {
      try {
        const post = new Post(postToSave);
        await post.save();
        let savedSubreddit;
        if (subReddit) {
          subReddit.scheduledPosts.pull(newPost);
          subReddit.posts.push(post);
          savedSubreddit = await subReddit.save();
        } else {
          user.scheduledPosts.pull(newPost);
          user.posts.push(post);
          await user.save();
        }
        console.log(savedSubreddit);
        if (savedSubreddit) {
          console.log("subReddit.moderators[0]");
          if (user._id.toString() !== savedSubreddit.moderators[0].toString()) {
            const receiver = await User.findById(savedSubreddit.moderators[0]);
            if (receiver.notificationSettings.get("modNotifications")) {
              await NotificationServices.sendNotification(
                receiver.userName,
                user.userName,
                post._id,
                null,
                "postedInSubreddit"
              );
              console.log("Notification Sent");
            }
          }
        }
        console.log("Post created successfully at scheduled time.");
      } catch (error) {
        console.log("Error creating post:", error.message);
      }
    });
    newPost.isScheduled = true;
    if (subReddit) {
      subReddit.scheduledPosts.push(newPost);
      await subReddit.save();
    } else {
      user.scheduledPosts.push(newPost);
      console.log(user.scheduledPosts);
      await user.save();
      console.log("User saved");
    }
    res.status(200).json({ message: "Post created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
  }
};
function createNewScheduledPost(req, userId, subRedditId, scheduledMinutes) {
  const pollOptions = req.body["poll.options"] || [];
  const votingLength = req.body["poll.votingLength"] || 0;
  const startTime = req.body["poll.startTime"] || null;
  const endTime = req.body["poll.endTime"] || null;
  const options = pollOptions.map((option) => ({
    option,
    voters: [],
  }));

  return new Post({
    user: userId,
    subReddit: subRedditId == "" ? null : subRedditId,
    title: req.body.title,
    text: req.body.text,
    images: req.body.images || [],
    videos: req.body.videos || [],
    url: req.body.url || "",
    type: req.body.type,
    isNSFW: req.body.isNSFW || false,
    isSpoiler: req.body.isSpoiler || false,
    isLocked: req.body.isLocked || false,
    upvotes: 1,
    downvotes: 0,
    views: 0,
    commentCount: 0,
    spamCount: 0,
    createdAt: new Date(),
    poll: {
      options: options,
      votingLength: votingLength,
      startTime: startTime,
      endTime: endTime,
    },
    isScheduled: true,
    scheduledMinutes: scheduledMinutes,
  });
}

const getAllPosts = async (req, res) => {
  const userId = req.userId;
  const sortMethod = req.query.sort;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  try {
    let user;
    let query = Post.find();
    if (userId) {
      user = await User.findById(userId);
      query = Post.find({ _id: { $nin: user.hidePosts } });
    }

    const result = await PostServices.paginatePosts(
      query,
      page,
      limit,
      sortMethod
    );
    if (result.slicedArray.length == 0) {
      return res.status(500).json({ message: "The retrieved array is empty" });
    }
    const postsWithVoteStatus = await Promise.all(
      result.slicedArray.map(async (post) => {
        let subreddit = null;
        if (post.subReddit) {
          subreddit = await SubReddit.findById(post.subReddit);
        }
        const creator = await User.findById(post.user);
        const creatorUsername = creator.userName;
        const creatorAvatar = await UserUploadModel.findById(
          creator.avatarImage
        );
        const subredditName = subreddit ? subreddit.name : null;
        const subredditAvatar = subreddit && subreddit.appearance.avatarImage 
        ? await UserUploadModel.findById(subreddit.appearance.avatarImage)
        : null;
        const isUpvoted = !userId
          ? false
          : post.upvotedUsers.includes(user._id);
        const isDownvoted = !userId
          ? false
          : post.downvotedUsers.includes(user._id);
        const isSaved = !userId ? false : user.savedPosts.includes(post._id);
        let imageUrls, videoUrls;
        if (post.type === "image") {
          imageUrls = await PostServices.getImagesUrls(post.images);
        }
        if (post.type === "video") {
          videoUrls = await PostServices.getVideosUrls(post.videos);
        }
        const postObj = {
          ...post._doc,
          creatorUsername,
          creatorAvatar: creatorAvatar ? creatorAvatar.url : null,
          subredditName,
          subredditAvatar: subredditAvatar ? subredditAvatar.url : null,
          isUpvoted,
          isDownvoted,
          isSaved,
          imageUrls,
          videoUrls,
        };
        delete postObj.images;
        delete postObj.videos;
        delete postObj.upvotedUsers;
        delete postObj.downvotedUsers;
        delete postObj.comments;
        delete postObj.spamCount;
        delete postObj.spammedBy;
        return postObj;
      })
    );
    return res.status(200).json({
      message: "Retrieved All Posts",
      posts: postsWithVoteStatus,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error Getting All Posts",
      error: err.message,
    });
  }
};
const deletePost = async (req, res) => {
  const postId = req.body.postId;
  const userId = req.userId;

  try {
    if (!postId) {
      return res
        .status(400)
        .json({ message: "Missing postId in request body" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.user.toString() !== userId) {
      return res
        .status(401)
        .json({ message: "User not authorized to delete post" });
    }
    if (post.subReddit) {
      const subReddit = await SubReddit.findById(post.subReddit);
      if (!subReddit) {
        return res.status(404).json({ message: "SubReddit not found" });
      }
      subReddit.posts.pull(postId);
      await subReddit.save();
    } else {
      const user = await User.findById(post.user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.posts.pull(postId);
      await user.save();
    }
    if (post.images.length > 0) {
      for (const imageId of post.images) {
        await UserUpload.destroyMedia(imageId);
      }
    }
    if (post.videos.length > 0) {
      for (const videoId of post.videos) {
        await UserUpload.destroyMedia(videoId);
      }
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
};

const searchPosts = async (req, res) => {
  const userId = req.userId;
  const search = req.query.search;
  const relevance = req.query.relevance === "true";
  const top = req.query.top === "true";
  const newest = req.query.new === "true";
  const mediaOnly = req.query.mediaOnly === "true";
  const isNSFW = req.query.isNSFW === "true";
  try {
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }
    let query = {};
    if (mediaOnly === true && isNSFW === true) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { text: { $regex: search, $options: "i" } },
        ],
        images: { $exists: true, $ne: [] },
      };
    }

    if (mediaOnly === false && isNSFW === true) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { text: { $regex: search, $options: "i" } },
        ],
      };
    }

    if (mediaOnly === true && isNSFW === false) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { text: { $regex: search, $options: "i" } },
        ],
        isNSFW: false,
        images: { $exists: true, $ne: [] },
      };
    }

    if (mediaOnly === false && isNSFW === false) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { text: { $regex: search, $options: "i" } },
        ],
        isNSFW: false,
      };
    }
    let sort = {};
    if (relevance || top) {
      sort.upvotes = -1;
    }
    if (newest) {
      sort.createdAt = -1;
    }
    const populatedPosts = await Post.find(query)
      .sort(sort)
      .populate({
        path: "user",
        model: "user",
        populate: {
          path: "avatarImage",
          model: "userUploads",
        },
      })
      .populate({
        path: "images",
        model: "userUploads",
      })
      .populate({
        path: "videos",
        model: "userUploads",
      });
    const posts = await Promise.all(
      populatedPosts.map(async (post) => {
        const score = post.upvotes - post.downvotes;
        isMember = user ? user.communities.includes(post.subReddit) : false;
        isFriend = user ? user.following.includes(post.userId) : false;
        let avatarImage = null;
        if (post.user && post.user.avatarImage) {
          avatarImage = post.user.avatarImage.url;
        }
        let subReddit = null;
        if (post.subReddit) {
          subReddit = await SubReddit.findById(post.subReddit);
        }
        let avatarImageSubReddit = null;
        if (subReddit) {
          const avatarImageId = subReddit.appearance.avatarImage;
          avatarImageSubReddit = avatarImageId
            ? await UserUploadModel.findById(avatarImageId.toString())
            : null;
        }
        let subredditBannerImage = null;
        if (subReddit) {
          const bannerImageId = subReddit.appearance.bannerImage;
          subredditBannerImage = bannerImageId
            ? await UserUploadModel.findById(bannerImageId.toString())
            : null;
        }
        return {
          postId: post._id,
          title: post.title,
          type: post.type,
          text: post.text,
          image:
            post.images && post.images.length > 0 ? post.images[0].url : null,
          video:
            post.videos && post.videos.length > 0 ? post.videos[0].url : null,
          URL: post.url,
          postUpvotes: post.upvotes,
          postDownvotes: post.downvotes,
          postCommentCount: post.comments.length,
          postKarma: post.upvotes - post.downvotes,
          postCommentKarma: post.comments.length,
          score: score,
          isUpvoted: post.upvotes > 0,
          isDownvoted: post.downvotes > 0,
          isNSFW: post.isNSFW,
          postCreatedAt: post.createdAt,
          userId: post.user ? post.user._id : null,
          userName: post.user ? post.user.userName : null,
          userAbout: post.user.profileSettings.get("about") || null,
          userNickName: post.user.profileSettings.get("displayName") || null,
          userAvatarImage: avatarImage,
          userBannerImage: post.user.profileSettings.get("bannerImage") || null,
          userKarma: post.user.upvotedPosts.length - post.user.downvotedPosts.length,
          userCreatedAt: post.user.createdAt,
          subreddit: subReddit ? subReddit.name : null,
          subRedditId: subReddit ? subReddit._id : null,
          avatarImageSubReddit: avatarImageSubReddit
            ? avatarImageSubReddit.url
            : null,
          subredditBannerImage: subredditBannerImage ? subredditBannerImage.url : null,
          subRedditDescription: subReddit ? subReddit.description : null,
          subRedditMembers: subReddit ? subReddit.members.length : null,
          subRedditNickName: subReddit ? subReddit.membersNickname : null,
          subRedditCreated: subReddit ? subReddit.createdAt : null,
          subredditcurrentlyViewingNickname: subReddit
            ? subReddit.currentlyViewingNickname
            : null,
          isFriend: isFriend,
          isMember: isMember,
        };
      })
    );
    let sortedPosts = posts;
    if (relevance === true) {
      sortedPosts = posts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    } else if (newest === true) {
      sortedPosts = posts.sort((a, b) => b.createdAt - a.createdAt);
    } else if (top === true) {
      sortedPosts = posts.sort((a, b) => (b.upvotes - b.downvotes + b.comments.length) - (a.upvotes - a.downvotes + a.comments.length));
    }
    res.status(200).json({
      message: "Posts retrieved successfully",
      posts: sortedPosts,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error searching posts",
      error: err.message,
    });
  }
};

const subredditPostSearch = async (req, res) => {
  const userId = req.userId;
  const search = req.query.search;
  const relevance = req.query.relevance === "true";
  const top = req.query.top === "true";
  const newest = req.query.new === "true";
  const mediaOnly = req.query.mediaOnly === "true";
  const isNSFW = req.query.isNSFW === "true";
  const subredditName = req.query.subredditName;
  try {
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }
    const subReddit = await SubReddit.findOne({ name: subredditName });
    if (!subReddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    const subredditPosts = await Post.find({ subReddit: subReddit._id });
    const postIds = subredditPosts.map((post) => post._id);
    let query = {};
    if (mediaOnly === true && isNSFW === true) {
      query = {
        _id: { $in: postIds },
        $or: [
          { title: { $regex: search, $options: "i" } },
          { text: { $regex: search, $options: "i" } },
        ],
        images: { $exists: true, $ne: [] },
      };
    }

    if (mediaOnly === false && isNSFW === true) {
      query = {
        _id: { $in: postIds },
        $or: [
          { title: { $regex: search, $options: "i" } },
          { text: { $regex: search, $options: "i" } },
        ],
      };
    }

    if (mediaOnly === true && isNSFW === false) {
      query = {
        _id: { $in: postIds },
        $or: [
          { title: { $regex: search, $options: "i" } },
          { text: { $regex: search, $options: "i" } },
        ],
        isNSFW: false,
        images: { $exists: true, $ne: [] },
      };
    }

    if (mediaOnly === false && isNSFW === false) {
      query = {
        _id: { $in: postIds },
        $or: [
          { title: { $regex: search, $options: "i" } },
          { text: { $regex: search, $options: "i" } },
        ],
        isNSFW: false,
      };
    }
    let sort = {};
    if (relevance || top) {
      sort.upvotes = -1;
    }
    if (newest) {
      sort.createdAt = -1;
    }
    const populatedPosts = await Post.find(query)
      .sort(sort)
      .populate({
        path: "user",
        model: "user",
        populate: {
          path: "avatarImage",
          model: "userUploads",
        },
      })
      .populate({
        path: "images",
        model: "userUploads",
      })
      .populate({
        path: "videos",
        model: "userUploads",
      });
    const posts = await Promise.all(
      populatedPosts.map(async (post) => {
        const score = post.upvotes - post.downvotes;
        const isMember = user ? user.communities.includes(post.subReddit) : false;
        const isFriend = user ? user.following.includes(post.userId) : false;
        let avatarImage = null;
        if (post.user && post.user.avatarImage) {
          avatarImage = post.user.avatarImage.url;
        }
        let subReddit = null;
        if (post.subReddit) {
          subReddit = await SubReddit.findById(post.subReddit);
        }
        let avatarImageSubReddit = null;
        if (subReddit) {
          const avatarImageId = subReddit.appearance.avatarImage;
          avatarImageSubReddit = avatarImageId
            ? await UserUploadModel.findById(avatarImageId.toString())
            : null;
        }
        let subredditBannerImage = null;
        if (subReddit) {
          const bannerImageId = subReddit.appearance.bannerImage;
          subredditBannerImage = bannerImageId
            ? await UserUploadModel.findById(bannerImageId.toString())
            : null;
        }
        return {
          postId: post._id,
          title: post.title,
          type: post.type,
          text: post.text,
          image:
            post.images && post.images.length > 0 ? post.images[0].url : null,
          video:
            post.videos && post.videos.length > 0 ? post.videos[0].url : null,
          URL: post.url,
          postUpvotes: post.upvotes,
          postDownvotes: post.downvotes,
          postCommentCount: post.comments.length,
          postKarma: post.upvotes - post.downvotes,
          postCommentKarma: post.comments.length,
          score: score,
          isUpvoted: post.upvotes > 0,
          isDownvoted: post.downvotes > 0,
          isNSFW: post.isNSFW,
          postCreatedAt: post.createdAt,
          userId: post.user ? post.user._id : null,
          userName: post.user ? post.user.userName : null,
          userAbout: post.user.profileSettings.get("about") || null,
          userNickName: post.user.profileSettings.get("displayName") || null,
          userAvatarImage: avatarImage,
          userBannerImage: post.user.profileSettings.get("bannerImage") || null,
          userKarma: post.user.upvotedPosts.length - post.user.downvotedPosts.length,
          userCreatedAt: post.user.createdAt,
          subreddit: subReddit ? subReddit.name : null,
          subRedditId: subReddit ? subReddit._id : null,
          avatarImageSubReddit: avatarImageSubReddit
            ? avatarImageSubReddit.url
            : null,
          subredditBannerImage: subredditBannerImage ? subredditBannerImage.url : null,
          subRedditDescription: subReddit ? subReddit.description : null,
          subRedditMembers: subReddit ? subReddit.members.length : null,
          subRedditNickName: subReddit ? subReddit.membersNickname : null,
          subRedditCreated: subReddit ? subReddit.createdAt : null,
          subredditcurrentlyViewingNickname: subReddit
            ? subReddit.currentlyViewingNickname
            : null,
          isFriend: isFriend,
          isMember: isMember,
        };
      })
    );
    let sortedPosts = posts;
    if (relevance === true) {
      sortedPosts = posts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    } else if (newest === true) {
      sortedPosts = posts.sort((a, b) => b.createdAt - a.createdAt);
    } else if (top === true) {
      sortedPosts = posts.sort((a, b) => (b.upvotes - b.downvotes + b.comments.length) - (a.upvotes - a.downvotes + a.comments.length));
    }
    res.status(200).json({
      message: "Posts retrieved successfully",
      posts: sortedPosts,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error searching posts",
      error: err.message,
    });
  }
};

const addVoteToPoll = async (req, res) => {
  const userId = req.userId;
  const postId = req.body.postId;
  const option = req.body.option;

  try {
    if (userId == null) {
      return res.status(401).json({ message: "User not found" });
    }
    const post = await Post.findById(postId).populate("poll.options.voters");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.type !== "poll") {
      return res.status(400).json({ message: "Post is not a poll" });
    }
    const optionVotedFor = post.poll.options.find(
      (opt) => opt.option === option
    );
    if (!optionVotedFor) {
      return res.status(400).json({ message: "Option not found" });
    }

    const votedOption = post.poll.options.find((option) =>
      option.voters.map((voter) => voter._id.toString()).includes(userId)
    );
    if (votedOption) {
      return res.status(400).json({
        message: `You already voted for option: ${votedOption.option}`,
      });
    }

    optionVotedFor.voters.push(userId);
    await post.save();
    res.status(200).json({ message: "Vote added to poll successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Error adding vote to poll",
      error: err.message,
    });
  }
};

module.exports = {
  savePost,
  unsavePost,
  hidePost,
  unhidePost,
  createPost,
  editPost,
  downvote,
  upvote,
  lockPost,
  unlockPost,
  getAllPostComments,
  markAsNSFW,
  unmarkAsNSFW,
  cancelUpvote,
  cancelDownvote,
  approvePost,
  removePost,
  markAsSpoiler,
  unmarkAsSpoiler,
  reportPost,
  getTrendingPosts,
  getPostById,
  scheduledPost,
  getAllPosts,
  deletePost,
  searchPosts,
  subredditPostSearch,
  addVoteToPoll,
};
