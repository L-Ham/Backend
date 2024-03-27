const Post = require("../models/post");
const User = require("../models/user");
const SubReddit = require("../models/subReddit");

const createPost = async (req, res, next) => {
  const userId = req.userId;
  const subRedditId = req.body.subreddit;

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    let subReddit = null;
    if (subRedditId != "") {
      subReddit = await SubReddit.findById(subRedditId);
      if (!subReddit) {
        console.error("Subreddit not found for subreddit ID:", subRedditId);
      }
    }

    const newPost = createNewPost(req, userId, subRedditId);
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
    isOc: req.body.isOc || false,
    votes: 0,
    views: 0,
    commentCount: 0,
    spamCount: 0,
    poll: req.body.poll
      ? {
          options: req.body.poll.options || [],
          votingLength: req.body.poll.votingLength || 0,
          voters: [],
          startTime: req.body.poll.startTime || null,
          endTime: req.body.poll.endTime || null,
        }
      : {},
  });
}

const editPost = (req, res, next) => {
  const postId = req.body.postId;
  const userId = req.userId;
  console.log("postId", postId);
  console.log("userId", userId);

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        console.error("Post not found for post ID:", postId);
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.user.toString() !== userId) {
        console.error("User not authorized to edit post");
        return res
          .status(401)
          .json({ message: "User not authorized to edit post" });
      }

      post.title = req.body.title || post.title;
      post.text = req.body.text || post.text;
      post.images = req.body.images || post.images;
      post.videos = req.body.videos || post.videos;
      post.url = req.body.url || post.url;
      post.type = req.body.type || post.type;
      post.isNSFW = req.body.isNSFW || post.isNSFW;
      post.isSpoiler = req.body.isSpoiler || post.isSpoiler;
      post.isLocked = req.body.isLocked || post.isLocked;
      post.isOc = req.body.isOc || post.isOc;
      post.poll = req.body.poll || post.poll;

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

const savePost = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }

      const save = user.savedPosts.find((savedPost) =>
        savedPost.equals(req.body.postId)
      );
      if (save) {
        console.error(
          "This post is already saved in your profile:",
          req.body.postId
        );
        return res
          .status(404)
          .json({ message: "This post is already saved in your profile" });
      }
      user.savedPosts.push(req.body.postId);

      user
        .save()
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

const unsavePost = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }

      const unsave = user.savedPosts.find((savedPost) =>
        savedPost.equals(req.body.postId)
      );
      if (!unsave) {
        console.error(
          "This post is not saved in your profile:",
          req.body.postId
        );
        return res
          .status(404)
          .json({ message: "This post is not saved in your profile" });
      }
      user.savedPosts.pull(req.body.postId);

      user
        .save()
        .then(() => {
          res.status(200).json({ message: "Post unsaved successfully" });
        })
        .catch((error) => {
          console.error("Error unsaving post:", error);
          res.status(500).json({ message: "Error unsaving post" });
        });
    })
    .catch((error) => {
      console.error("Error finding user:", error);
      res.status(500).json({ message: "Error finding user" });
    });
};
async function hidePost(req, res, next) {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const isAlreadyHidden = user.hidePosts.some((hidePost) =>
      hidePost._id.equals(req.body.postId)
    );
    if (isAlreadyHidden) {
      console.log(
        "This post is already hidden in your profile:",
        req.body.postId
      );
      return res
        .status(404)
        .json({ message: "This post is already hidden in your profile" });
    }

    user.hidePosts.push(req.body.postId);
    await user.save();

    res.status(200).json({ message: "Post hidden successfully" });
  } catch (error) {
    console.log("Error hidding post:", error);
    res.status(500).json({ message: "Error hidding post" });
  }
}


const unhidePost = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }

      const unhide = user.hidePosts.find((hidePost) =>
        hidePost._id.equals(req.body.postId)
      );
      if (!unhide) {
        console.error(
          "This post is not hidden in your profile:",
          req.body.Post
        );
        return res
          .status(404)
          .json({ message: "This post is not hidden in your profile" });
      }
      user.hidePosts.pull(req.body.postId);

      user
        .save()
        .then(() => {
          res.status(200).json({ message: "Post unhidden successfully" });
        })
        .catch((error) => {
          console.error("Error unhidding post:", error);
          res.status(500).json({ message: "Error unhidding post" });
        });
    })
    .catch((error) => {
      console.error("Error finding user:", error);
      res.status(500).json({ message: "Error finding user" });
    });
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
};
