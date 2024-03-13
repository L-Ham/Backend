const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  reportId: {
    type: Number,
    required: true,
  },
  referenceType: {
    type: String,
    enum: ["user", "post", "comment"],
    required: true,
  },
  referenceId: {
    type: Number,
    required: true,
  },
  viewerId: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isReviewed: {
    type: Number,
    required: true,
  },
});

module.exports = moon.model("report", reportSchema);
