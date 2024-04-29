const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const Schema = mongoose.Schema;
const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    replies: [
        {
            type: Schema.Types.ObjectId,
            ref: "message",
            default: null
        }
    ],
    parentMessageId: [
        {
            type: Schema.Types.ObjectId,
            ref: "message",
            default: null
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },


});

module.exports = mongoose.model("message", messageSchema);
