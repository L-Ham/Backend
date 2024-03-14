const mongoose = require("mongoose");
const SocialLinks = require("../models/socialLink");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  user_ID: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  allowFollow: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  friends: {
    type: [Number],
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  isNSFW: {
    type: Boolean,
    required: false,
  },
  postHistory: {
    type: String,
    required: true,
  },
  About: {
    type: String,
    required: false,
  },
  socialLinks: {
    type: [SocialLinks],
    required: false,
  },
  bannerImage: {
    type: String,
    required: false,
  },
  contentVisibility: {
    type: Boolean,
    required: false,
  },
  communitiesVisibility: {
    type: Boolean,
    required: false,
  },
  clearHistory: {
    type: Boolean,
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
});

module.exports = mongoose.model("user", userSchema);
