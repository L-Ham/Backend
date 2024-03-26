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
  votes: {
    type: Number,
    required: false,
  },
  isHidden: {
    type: Boolean,
    required: false,
  },
});
module.exports = mongoose.model("comment", commentSchema);
