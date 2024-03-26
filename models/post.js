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
  },
  text: {
    type: String,
    required: false,
  },
  images: {
    type: [
      {
        type: String,
        required: false,
      },
    ],
    default: [],
  },
  videos: {
    type: [
      {
        type: String,
        required: false,
      },
    ],
    default: [],
  },
  url: {
    type: String,
    required: false,
  },
  poll: {
    options: {
      type: [String],
      required: false,
      default: [],
    },
    votingLength: {
      type: Number,
      required: false,
      default: 0,
    },
    voters: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user",
      },
    ],
    startTime: {
      type: Date,
      required: false,
    },
    endTime: {
      type: Date,
      required: false,
    },
  },
  type: {
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
  isOc: {
    type: Boolean,
    required: true,
    default: false,
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
  views: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  commentCount: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  spamCount: {
    type: Number,
    required: true,
    default: 0,
  },
  spammedBy: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
    },
  ],
  comments: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "comment",
    },
  ],
});

module.exports = mongoose.model("post", postSchema);
