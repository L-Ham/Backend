const mongoose = require("mongoose");
const SocialLinks = require("../models/socialLink");
const SubReddit = require("../models/subReddit");
const Post = require("../models/post");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  // user_ID: {
  //   type: String,
  //   required: true,
  //   unique: true,
  // },
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
  allowFollow: {
    type: String,
    required: false,
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
    unique: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  isNSFW: {
    type: Boolean,
    required: false,
  },
  postHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
  ],
  About: {
    type: String,
    required: false,
  },
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
