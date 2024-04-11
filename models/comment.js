const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: "post",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  images: [
    {
      type: Schema.Types.ObjectId,
      ref: "userUploads",
      required: false,
    },
  ],
  videos: [
    {
      type: Schema.Types.ObjectId,
      ref: "userUploads",
      required: false,
    },
  ],
  url: {
    type: [String],
    required: false,
  },
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "comment",
      required: false,
    },
  ],
  parentCommentId: [
    {
      type: Schema.Types.ObjectId,
      ref: "comment",
      required: false,
    },
  ],
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
  isHidden: {
    type: Boolean,
    required: false,
  },
  isLocked:{
    type: Boolean,
    required: false
  }
});
module.exports = mongoose.model("comment", commentSchema);
