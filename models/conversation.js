const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    chatName: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: true,
    },
    participants: [
      {
        type: String,
        required: true,
      },
    ],
    participantsAvatarUrls: [
      {
        type: String,
        required: false,
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("conversation", conversationSchema);
