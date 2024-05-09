const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const notificationSchema = new Schema(
  {
    sent: {
      title: {
        type: String,
        required: true,
      },
      body: {
        type: String,
        required: true,
      },
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    senderName: {
      type: String,
      required: true,
    },
    senderAvatar: {
      type: String,
      required: false,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    receiverName: {
      type: String,
      required: true,
    },
    receiverAvatar: {
      type: String,
      required: false,
    },
    subredditName: {
      type: String,
      required: false,
    },
    subredditAvatar: {
      type: String,
      required: false,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "post",
      required: false,
    },
    content: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("notification", notificationSchema);
