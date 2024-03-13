const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const Schema = mongoose.Schema;
const messageSchema = new Schema({
    message_ID: {
    type: Number,
    required: true,
    unique: true,
    primary: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = mongoose.model("message", messageSchema);
