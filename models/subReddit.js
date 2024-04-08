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
  widgets: {
    type: [Object], // Define it as an array of objects
    default: [], // Default value is an empty array
  },
  // widgets: [
  //   {
  //     type: {
  //       type: String,
  //       enum: ["textWidgets", "rulesWidgets"],
  //       required: true,
  //     },
  //     data: [
  //       {
  //         // For textWidgets
  //         widgetName: {
  //           type: String,
  //           required: false,
  //         },
  //         text: {
  //           type: String,
  //           required: false,
  //         },
  //         // For rulesWidgets
  //         ruleText: {
  //           type: String,
  //           required: false,
  //           unique: true,
  //         },
  //         reportReason: {
  //           type: String,
  //           required: false,
  //         },
  //         appliesTo: {
  //           type: String,
  //           required: false,
  //         },
  //         fullDescription: {
  //           type: String,
  //           required: false,
  //         },
  //       },
  //     ],
  //   },
  // ],
  //1st VERSION
  // widgets: {
  //   textWidgets: [
  //     {
  //       widgetName: {
  //         type: String,
  //         required: true,
  //       },
  //       text: {
  //         type: String,
  //         required: true,
  //       },
  //     },
  //   ],
  //   rulesWidgets: [
  //     {
  //       ruleText: {
  //         type: String,
  //         required: true,
  //         unique: true,
  //       },
  //       reportReason: {
  //         type: String,
  //         required: false,
  //       },
  //       appliesTo: {
  //         type: String,
  //         required: true,
  //       },
  //       fullDescription: {
  //         type: String,
  //         required: false,
  //       },
  //     },
  //   ],
  // },
  widgets: {
    type: Schema.Types.Mixed,
    required: false,
  },
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
