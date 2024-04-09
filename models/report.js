const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  type: {
    type: String,
    enum: ["user", "post", "comment"],
    required: true,
  },
  referenceId: {
    type: Schema.Types.ObjectId,
    refPath: 'type', // Reference model is determined by the value of 'type' field
    required: true
  },
  repoterId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  repotedId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  subredditId: {
    type: Schema.Types.ObjectId,
    ref: "subReddit",
    required: false,
  },
  title: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  blockUser: {
    type: Boolean,
    required: true,
    default: false,
  },
  isReviewed: {
    type: Boolean,
    required: false,
    default: false,
  },
});

module.exports = moon.model("report", reportSchema);
