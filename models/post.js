const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const Schema = mongoose.Schema;
const postSchema = new Schema({
  post_ID: {
    type: Number,
    required: true,
    unique: true,
    primary: true
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
    required: true
  },
  isNSFW: {
    type: Boolean,
    required: true,
    default: false
  },
  isSpoiler: {
    type: Boolean,
    required: true,
    default: false
  },
  isLocked: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = mongoose.model("post", postSchema);
