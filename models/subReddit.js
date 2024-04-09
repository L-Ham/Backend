const { text } = require("body-parser");
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
  communityDetails: {
    type: Map,
    of: String,
    required: false,
    default: {
      membersNickname: "Members",
      currentlyViewingNickname: "Online",
      communityDescription: "",
    },
  },
  textWidgets: [
    {
      widgetName: {
        type: String,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
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
        required: false,
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

  appearance: {
    bannerImage: {
      type: Schema.Types.ObjectId,
      ref: "userUploads",
      required: false,
      default: null,
    },
    avatarImage: {
      type: Schema.Types.ObjectId,
      ref: "userUploads",
      required: false,
      default: null,
    },
    keyColor: {
      hue: {
        type: Number,
        required: false,
      },
      saturation: {
        type: Number,
        required: false,
      },
      hexCode: {
        type: String,
        required: false,
      },
    },
    baseColor: {
      hue: {
        type: Number,
        required: false,
      },
      saturation: {
        type: Number,
        required: false,
      },
      hexCode: {
        type: String,
        required: false,
      },
    },
    stickyPostColor: {
      hue: {
        type: Number,
        required: false,
      },
      saturation: {
        type: Number,
        required: false,
      },
      hexCode: {
        type: String,
        required: false,
      },
    },
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
    required: false,
  },
  title: {
    type: String,
    required: false,
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
});

module.exports = mongoose.model("subreddits", subRedditSchema);
