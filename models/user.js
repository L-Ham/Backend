const mongoose = require("mongoose");
const SocialLinks = require("../models/socialLink");
const SubReddit = require("../models/subReddit");
const Post = require("../models/post");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  signupGoogle: {
    type: Boolean,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  friends: {
    type: [Number],
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  postHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
  ],
  socialLinks: [
    {
      type: Schema.Types.ObjectId,
      ref: "socialLink",
    },
  ],
  bannerImage: {
    type: String,
    required: false,
  },
  notificationSettings: {
    type: Map,
    of: Boolean,
    required: true,
    default: {
      inboxMessage: true,
      chatMessages: true,
      chatRequest: true,
      mentions: true,
      comments: true,
      upvotesToPosts: true,
      upvotesToComments: true,
      repliesToComments: true,
      newFollowers: true,
      modNotifications: true,
    },
  },
  profileSettings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true,
    default: {
      displayName: "",
      about: "",
      avatarImage: "",
      bannerImage: "",
      NSFW: false,
      allowFollow: true,
      contentVisibility: true,
      communitiesVisibility: true,
      clearHistory: false,
    },
  },
  blockUsers: {
    type: [{ type: Schema.Types.ObjectId, ref: "user" }],
    required: false,
  },
  muteCommunities: {
    type: Schema.Types.ObjectId,
    ref: "subReddit",
  },

  communities: {
    type: [Schema.Types.ObjectId],
    ref: "subReddit",
  },
});

module.exports = mongoose.model("user", userSchema);
