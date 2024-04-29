const Message = require("../models/message");
const SubReddit = require("../models/subReddit");
const User = require("../models/user");

const composeMessage = async (req, res, next) => {
    const senderId = req.userId;
    const receiverName = req.body.receiverName;
    const subject = req.body.subject;
    const message = req.body.message;
    const isSubreddit = req.body.isSubreddit;
    const parentMessageId = req.body.parentMessageId;
    try {
        const user = await User.findById(senderId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const parentMessage = await Message.findById(parentMessageId);
        if (isSubreddit) {
            const subreddit = await SubReddit.findOne({ name: receiverName });
            if (!subreddit) {
                return res.status(404).json({ message: "Subreddit not found" });
            }
            const moderators = subreddit.moderators;
            for (const moderator of moderators) {
                const newMessage = new Message({
                    sender: senderId,
                    receiver: moderator,
                    subject: subject,
                    message: message,
                    replies: [],
                    parentMessageId: parentMessageId || null,
                });
                if(parentMessage) {
                    parentMessage.replies.push(newMessage._id.toString());
                    await parentMessage.save();
                }
                await newMessage.save();
            }
        }
        if (!isSubreddit) {
            const receiver = await User.findOne({ userName: receiverName });
            if (!receiver) {
                return res.status(404).json({ message: "Receiver not found" });
            }
            const newMessage = new Message({
                sender: senderId,
                receiver: receiver._id.toString(),
                subject: subject,
                message: message,
                replies: [],
                parentMessageId: parentMessageId || null,
            });
            if(parentMessage) {
                parentMessage.replies.push(newMessage._id.toString());
                await parentMessage.save();
            }
            await newMessage.save();
        }
        res.status(200).json({ message: "Message sent" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    composeMessage
};