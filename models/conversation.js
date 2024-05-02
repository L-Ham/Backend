const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    chatName: {
      type: String,
      required: true,
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
