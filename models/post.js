const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const Schema = mongoose.Schema;
const postSchema = new Schema({
  post_ID: {
    type: Number,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  upvotes: {
    type: Number,
    required: true,
    default: 0,
  },
  downvotes: {
    type: Number,
    required: true,
    default: 0,
  },
  upvotedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  ],
  downvotedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  ],
  title: {
    type: String,
    required: true,
  },
  isNSFW: {
    type: Boolean,
    required: true,
    default: false,
  },
  isSpoiler: {
    type: Boolean,
    required: true,
    default: false,
  },
  isLocked: {
    type: Boolean,
    required: true,
    default: false,
  },
  comments: {
    type: [Schema.Types.ObjectId],
    ref: "comment",
  },
});

module.exports = mongoose.model("post", postSchema);
