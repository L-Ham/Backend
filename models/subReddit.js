const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const Schema = mongoose.Schema;
const subRedditSchema = new Schema({
    subReddit_ID: {
    type: Number,
    required: true,
    unique: true,
    primary: true
  },
  privacy: {
    type: String,
    required: true,
    default: "public"
  },
  name: {
    type: String,
    required: true
  },
  ageRestriction: {
    type: Boolean,
    required: true,
    default: false
  },
  numberOfMembers: {
    type: number,
    required: true,
    default: 0
  }
});

module.exports = mongoose.model("subReddit", subRedditSchema);
