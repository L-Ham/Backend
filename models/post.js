const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const Schema = mongoose.Schema;
const postSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  subReddit: {
    type: Schema.Types.ObjectId,
    ref: "subReddit",
    required: false,
  },
  title: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  votes: {
    type: Number,
    required: true
  },
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
    ref: "comment"
  }
  
});

module.exports = mongoose.model("post", postSchema);
