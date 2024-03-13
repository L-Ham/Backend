const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  user_ID: {
    type: String,
    required: true,
    unique: true
  },
  userName: {
    type: String,
    required: true,
    unique: true
  },  
  name: {
    type: String,
    required: false
  },
  gender: {
    type: String,
    required: false
  },
  allowFollow: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  friends: {
    type: [Number],
    required: true
  },
  email: {
    type: String,
    required: true
  },
  avatar: {
    type: Image,
    required: false
  },
  isNSFW: {
    type: Boolean,
    required: false
  },
  postHistory: {
    type: string,
    required: true
  },
  About: {
    type: string,
    required: false
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
      modNotifications: true
    }
  }
});

module.exports = mongoose.model("user", userSchema);
