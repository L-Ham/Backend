const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const Schema = mongoose.Schema;
const subRedditSchema = new Schema({
  posts: {
    type: [Schema.Types.ObjectId],
    ref: "post",
  },
  privacy: {
    type: String,
    required: true,
    default: "public",
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  moderators: {
    type: [Schema.Types.ObjectId],
    ref: "user",
  },
  members: {
    type: [Schema.Types.ObjectId],
    ref: "user",
  },
  ageRestriction: {
    type: Boolean,
    required: true,
    default: false,
  },
  numberOfMembers: {
    type: Number,
    required: true,
    default: 0,
  },
  description: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  submissionText: {
    type: String,
    required: false
  },
  contentOptions: {
    type: String,
    required: false
  },
  wiki: {
    type: String,
    required: false,
  },
  spamFilter: {
    type: [String],
    required: true,
    default: ["low", "low", "low"],
  },
  discoverabilityOptions: {
    type: [Boolean],
    required: true,
    default: [false, false, false],
  },
  otherOptions: {
    type: [String],
    required: true,
    default: ["low", "low", "low"],
  },
  mobileLookAndFeel: {
    type: String,
    required: true,
    default: "red",
  },
});

module.exports = mongoose.model("subreddits", subRedditSchema);
