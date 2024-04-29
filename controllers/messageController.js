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
                if (parentMessage) {
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
            if (parentMessage) {
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


const readMessage = async (req, res, next) => {
    const userId = req.userId;
    const messageId = req.body.messageId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        if (message.receiver.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized You are not the message receiver" });
        }
        if (message.isRead) {
            return res.status(400).json({ message: "Message already read" });
        }
        message.isRead = true;
        await message.save();
        res.status(200).json({ message: "Message Marked as Read" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const unreadMessage = async (req, res, next) => {
    const userId = req.userId;
    const messageId = req.body.messageId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        if (message.receiver.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized You are not the message receiver" });
        }
        if (!message.isRead) {
            return res.status(400).json({ message: "Message already Unread" });
        }
        message.isRead = false;
        await message.save();
        res.status(200).json({ message: "Message Marked as Unread" });
    }
    catch (error) {
        res.status(500).json({ message: "Error Marking Message as Unread", error: error.message });
    }
};

const getAllInboxMessages = async (req, res, next) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const messages = await Message.find({ receiver: userId });
        const populatedMessages = await Promise.all(messages.map(async (message) => {
            const sender = await User.findById(message.sender);
            const receiver = await User.findById(message.receiver);
            const parentMessage = await Message.findById(message.parentMessageId);
            const replies = await Message.find({ _id: { $in: message.replies } });
            const populatedReplies = await Promise.all(replies.map(async (reply) => {
                const sender = await User.findById(reply.sender);
                const receiver = await User.findById(reply.receiver);
                return {
                    sender: sender.userName,
                    receiver: receiver.userName,
                    subject: reply.subject,
                    message: reply.message,
                    isRead: reply.isRead,
                    createdAt: reply.createdAt,
                };
            }));
            return {
                sender: sender.userName,
                receiver: receiver.userName,
                subject: message.subject,
                message: message.message,
                isRead: message.isRead,
                createdAt: message.createdAt,
                parentMessage: parentMessage,
                replies: populatedReplies
            };
        }));

        res.status(200).json({ messages: populatedMessages });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    composeMessage,
    readMessage,
    unreadMessage,
    getAllInboxMessages,
};