const Post = require("../models/post");
const User = require("../models/user");
const SubReddit = require("../models/subReddit");
const Comment = require("../models/comment");
const UserUpload = require("../controllers/userUploadsController");
const Report = require("../models/report");
const mongoose = require("mongoose");
const UserUploadModel = require("../models/userUploads");



const createPost = async (req, res, next) => {
  const userId = req.userId;
  const subRedditId = req.body.subRedditId;

  const user = await User.findById(userId);
  if (!user) {
    console.error("User not found for user ID:", userId);
    return res.status(404).json({ message: "User not found" });
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
          console.log("henaaaaaaaaaaaaaaaaaaaaaa poll");
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
      console.log("subReddit", subReddit);
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
            console.error("Media upload failed:", media);
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
    res.status(200).json({ message: "Post created successfully" });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Error creating post" });
  }
};
function createNewPost(req, userId, subRedditId) {
  const pollOptions = req.body["poll.options"] || [];
  const votingLength = req.body["poll.votingLength"] || 0;
  const startTime = req.body["poll.startTime"] || null;
  const endTime = req.body["poll.endTime"] || null;
  const options = pollOptions.map(option => ({
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
      post
        .save()
        .then(() => {
          res.status(200).json({ message: "Post updated successfully" });
        })
        .catch((error) => {
          console.error("Error updating post:", error);
          res.status(500).json({ message: "Error updating post" });
        });
    })
    .catch((error) => {
      console.error("Error finding post:", error);
      res.status(500).json({ message: "Error finding post" });
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
    console.log(user.savedPosts);
    user.savedPosts.pull(postId);
    console.log(user.savedPosts);
    await user.save();

    res.status(200).json({ message: "Post unsaved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error unsaving post" });
  }
};
/**
 * Upvotes a post and adds it to the user's upvoted posts list and adds the user to the Post's list of upvotes.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the post is upvoted.
 */
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
    res.status(200).json({ message: "Post upvoted & added to user" });
  } catch (err) {
    res.status(500).json({ message: "Error upvoting post", error: err });
  }
};

/**
 * Downvotes a post and updates the user's downvoted posts.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the post is downvoted.
 */
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
    console.log(post.upvotedUsers);
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
    res.status(200).json({ message: "Post downvoted & added to user" });
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
    console.log("Error hidding post:", error);
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
      console.error("User not found for user ID:", userId);
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

    console.log("Post unhidden successfully");
    res.status(200).json({ message: "Post unhidden successfully" });
  } catch (error) {
    console.error("Error unhidding post:", error);
    res.status(500).json({ message: "Error unhidding post" });
  }
};

const lockPost = async (req, res, next) => {
  const postId = req.body.postId;
  const userId = req.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      console.error("Post not found for post ID:", postId);
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const subReddit = await SubReddit.findById(post.subReddit);
    if (!subReddit) {
      console.error("SubReddit not found for ID:", post.subReddit);
      return res.status(404).json({ message: "SubReddit not found" });
    }

    if (post.subReddit === null) {
      if (!post.user.equals(userId)) {
        console.error("User not authorized to lock post");
        return res
          .status(400)
          .json({ message: "User not authorized to lock post" });
      }
    }
    if (post.subReddit !== null) {
      if (!post.subReddit.moderators.includes(userId)) {
        console.error(
          "User not authorized to lock post in the subreddit",
          post.subReddit.name
        );
        return res.status(400).json({
          message: "User not authorized to lock post in the subreddit",
        });
      }
    }
    if (post.isLocked === true) {
      console.error("Post is already locked");
      return res.status(400).json({ message: "Post is already locked" });
    }
    post.isLocked = true;
    await post.save();

    res.status(200).json({ message: "Post locked successfully" });
  } catch (error) {
    console.error("Error locking post:", error);
    res.status(500).json({ message: "Error locking post" });
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
      console.error("Post not found for post ID:", postId);
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const subReddit = await SubReddit.findById(post.subReddit);
    if (!subReddit) {
      console.error("SubReddit not found for ID:", post.subReddit);
      return res.status(404).json({ message: "SubReddit not found" });
    }

    if (post.subReddit === null) {
      if (!post.user.equals(userId)) {
        console.error("User not authorized to lock post");
        return res
          .status(400)
          .json({ message: "User not authorized to lock post" });
      }
    }
    if (post.subReddit !== null) {
      if (!post.subReddit.moderators.includes(userId)) {
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
      console.error("Post is already unlocked");
      return res.status(400).json({ message: "Post is already unlocked" });
    }
    post.isLocked = false;

    await post.save();

    res.status(200).json({ message: "Post unlocked successfully" });
  } catch (error) {
    console.error("Error unlocking post:", error);
    res.status(500).json({ message: "Error unlocking post" });
  }
};
const getAllPostComments = async (req, res, next) => {
  const postId = req.query.postId;
  console.log("postId", postId);
  try {
    const post = await Post.findById(postId).populate("comments");
    if (!post) {
      console.log("Post not found for post ID:", postId);
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({
      message: "Comments retrieved successfully",
      comments: post.comments,
    });
  } catch (error) {
    console.log("Error getting comments for post:", error);
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

    if (post.user.toString() !== userId) {
      return res
        .status(401)
        .json({ message: "User not authorized to mark post as NSFW" });
    }
    if (post.subReddit) {
      const postSubreddit = await SubReddit.findById(post.subReddit);
      if (!postSubreddit.moderators.includes(userId)) {
        return res
          .status(401)
          .json({ message: "User not authorized to mark post as NSFW" });
      }
    }
    post.isNSFW = true;
    await post.save();
    res.status(200).json({ message: "Post marked as NSFW" });
  } catch (error) {
    console.log("Error Marking post as NSFW:", error);
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

    if (post.user.toString() !== userId) {
      return res
        .status(401)
        .json({ message: "User not authorized to unmark post as NSFW" });
    }
    if (post.subReddit) {
      const postSubreddit = await SubReddit.findById(post.subReddit);
      if (!postSubreddit.moderators.includes(userId)) {
        return res
          .status(401)
          .json({ message: "User not authorized to unmark post as NSFW" });
      }
    }
    post.isNSFW = false;
    await post.save();
    res.status(200).json({ message: "Post unmarked as NSFW" });
  } catch (error) {
    console.log("Error Unmarking post as NSFW:", error);
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
    if (post.disapproved) {
      return res.status(400).json({ message: "Post already disapproved" });
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
    post.approved = true;
    post.approvedBy = userId;
    await post.save();
    res.status(200).json({ message: "Post approved successfully" });
  } catch (error) {
    console.log("Error approving post:", error);
    res.status(500).json({ message: "Error approving post" });
  }
};

const removePost = async (req, res, next) => {
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
    const subReddit = await SubReddit.findById(post.subReddit);
    if (!subReddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subReddit.moderators.includes(userId)) {
      return res
        .status(401)
        .json({ message: "User not authorized to remove post" });
    }
    if (post.approved == true) {
      return res.status(400).json({ message: "Post already approved" });
    }
    if (post.disapproved == true) {
      return res.status(400).json({ message: "Post already disapproved" });
    }
    post.disapproved = true;
    post.disapprovedBy = userId;
    await post.save();
    subReddit.removedPosts.push(postId);
    await subReddit.save();
    res.status(200).json({ message: "Post removed successfully" });
  } catch (error) {
    console.log("Error removing post:", error);
    res.status(500).json({ message: "Error removing post" });
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

    if (post.user.toString() !== userId) {
      return res
        .status(401)
        .json({ message: "User not authorized to mark post as spoiler" });
    }
    if (post.subReddit) {
      const postSubreddit = await SubReddit.findById(post.subReddit);
      if (!postSubreddit.moderators.includes(userId)) {
        return res
          .status(401)
          .json({ message: "User not authorized to mark post as spoiler" });
      }
    }
    post.isSpoiler = true;
    await post.save();
    res.status(200).json({ message: "Post marked as spoiler" });
  } catch (error) {
    console.log("Error Marking post as spoiler:", error);
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

    if (post.user.toString() !== userId) {
      return res
        .status(401)
        .json({ message: "User not authorized to unmark post as spoiler" });
    }
    if (post.subReddit) {
      const postSubreddit = await SubReddit.findById(post.subReddit);
      if (!postSubreddit.moderators.includes(userId)) {
        return res
          .status(401)
          .json({ message: "User not authorized to unmark post as spoiler" });
      }
    }
    post.isSpoiler = false;
    await post.save();
    res.status(200).json({ message: "Post unmarked as spoiler" });
  } catch (error) {
    console.log("Error Unmarking post as spoiler:", error);
    res.status(500).json({ message: "Error Unmarking post as spoiler" });
  }
};

const reportPost = async (req, res, next) => {
  const userId = req.userId;
  const postId = req.body.postId;
  const title = req.body.title;
  const description = req.body.description;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const postOwner = await User.findById(post.user);
    if (!postOwner) {
      return res.status(404).json({ message: "Post owner not found" });
    }
    // if (user.blockUsers.includes(postOwner._id)) {
    //   return res
    //     .status(400)
    //     .json({ message: "You have already blocked this user" });
    // }

    // user.blockUsers.some((blockedUser) => blockedUser.blockedUserId.equals(postOwner._id))
    if (title == "") {
      return res.status(400).json({ message: "Title is required" });
    }
    if (description == "") {
      return res.status(400).json({ message: "Description is required" });
    }
    if (
      user.blockUsers.some((blockedUser) =>
        blockedUser.blockedUserId.equals(postOwner._id)
      )
    ) {
      console.log("User already blocked:", postOwner.userName);
      return res.status(409).json({ message: "User already blocked" });
    }

    const subRedditId = post.subReddit;
    const report = new Report({
      type: "post",
      referenceId: postId,
      reporterId: userId,
      reportedId: postOwner._id,
      subredditId: subRedditId || null,
      title: title || "",
      description: description,
      blockUser: req.body.blockUser || false,
    });

    if (req.body.blockUser) {
      user.blockUsers.push({
        blockedUserId: postOwner._id,
        blockedUserName: postOwner.userName,
        blockedUserAvatar: postOwner.avatarImage,
        blockedAt: new Date(),
      });
      //user.blockUsers.push(postOwner._id);
      await user.save();
    }

    await report.save();
    res.status(200).json({ message: "Post reported successfully" });
  } catch (err) {
    console.error("Error reporting post:", err);
    res.status(500).json({ message: "Error reporting post", error: err });
  }
};
const getTrendingPosts = async (req, res, next) => {
  try {
    const trendingPosts = await Post.find()
      .sort({ upvotes: -1, downvotes: 1 })
      .limit(6);

    const postImagesIds = trendingPosts.map(post => post.images[0]);
    const subRedditIds = trendingPosts.map(post => post.subReddit);

    const [Images, subReddits] = await Promise.all([
      UserUploadModel.find({ _id: { $in: postImagesIds } }),
      SubReddit.find({ _id: { $in: subRedditIds } })
      
    ]);
    //avatarImages = await UserUploadModel.find({ _id: { $in: subReddits.map(community => community.appearance.avatarImage) } })
    const formattedPosts = trendingPosts.map(post => {
      const Image = Images.find(image => image._id.equals(post.images[0]));
      const subRedditTemp = subReddits.find(community => community._id.equals(post.subReddit));
      //const avatarImage = subReddit ? avatarImages.find(image => image._id.equals(subReddit.appearance.avatarImage)) : null;
      if(subRedditTemp) {
      return {
        postId: post._id,
        title: post.title,
        text: post.text,
        image: Image ? Image.url : null,
        subreddit: subRedditTemp.name || null,
        subRedditId: subRedditTemp ? subRedditTemp._id : null,
        //avatarImageUrl: avatarImage ? avatarImage.url : null,
        // upvotes: post.upvotes,
        // downvotes: post.downvotes
      };
    }
    });

    const sortedPosts = formattedPosts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));

    res.json({ trendingPosts: sortedPosts });
  } catch (error) {
    res.status(500).json({ message: "Error processing trending posts", error: error.message });
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
};
