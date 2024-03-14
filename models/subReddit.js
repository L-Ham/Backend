const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const Schema = mongoose.Schema;
const subRedditSchema = new Schema({
  subReddit_ID: {
    type: Number,
    required: true,
    unique: true,
  },
  privacy: {
    type: String,
    required: true,
    default: "public",
  },
  name: {
    type: String,
    required: true,
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
    required: true
  },
  title: {
    type: String,
    required: true
  },
  sideBar: {
    type: String,
    required: true
  },
  contentOptions: {
    type: String,
    required: true,
    default: "any"
  },
  wiki: {
    type: String,
    required: true,
    default: "disabled"
  },
  spamFilter: {
    type: [String],
    required: true,
    default: ["low","low","low"]
  },
  discoverabilityOptions: {
    type: [Boolean],
    required: true,
    default: [false,false,false]
  },
  otherOptions: {
    type: [String],
    required: true,
    default: ["low","low","low"]
  },
  mobileLookAndFeel: {
    type: String,
    required: true,
    default: "red"
  }
});

module.exports = mongoose.model("subReddit", subRedditSchema);
