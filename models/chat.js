const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const chatSchema = new Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    receiverId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
    receiverName: {
      type: [String],
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // createdAt, updatedAt
  },
  { timestamps: true }
);

module.exports = mongoose.model("chat", chatSchema);
