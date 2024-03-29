const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const Schema = mongoose.Schema;
const subRedditSchema = new Schema({
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
  ],
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
  pendingMembers: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  pendingPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  removedPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  reportedPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  pendingComments: [
    {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  rules: [
    {
      ruleText: {
        type: String,
        required: true,
        unique: true,
      },
      reportReason: {
        type: String,
        required: true,
      },
      appliesTo: {
        type: String,
        required: true,
      },
      fullDescription: {
        type: String,
        required: false,
      },
    },
  ],
  // widgets: [
  //   {
  //     textWidget: {
  //       widgetName: {
  //         type: String,
  //         required: true,
  //       },
  //       text: { type: String, required: true },
  //     },
  //     rulesWidget: {},
  //   },
  // ],
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
    required: false,
  },
  contentOptions: {
    type: String,
    required: false,
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
  rules: [
    {
      rule: { type: String, required: true },
      description: { type: String, required: true },
      appliedTo: { type: String, required: true },
      reportReasonDefault: { type: String, default: "Rule" },
    },
  ],
});

module.exports = mongoose.model("subreddits", subRedditSchema);
