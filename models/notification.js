const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  type: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("notification", notificationSchema);
