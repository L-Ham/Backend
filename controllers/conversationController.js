const Conversation = require("../models/conversation");
const User = require("../models/user");
const Chat = require("../models/chat");
const UserUploadModel = require("../models/userUploads");

const createChat = async (req, res) => {
  const userId = req.userId;
  const chatName = req.body.chatName;
  const participants = req.body.participants;
  const type = participants.length > 1 ? "group" : "single";
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  participants.push(user.userName);
  const participantsAvatarUrls = [];
  for (participant of participants) {
    const user = await User.findOne({ userName: participant });
    if (!user) {
      return res
        .status(404)
        .json({ error: "One/Some of the Participants don't exist" });
    }
    const userUpload = await UserUploadModel.findOne({ _id: user.avatarImage });
    participantsAvatarUrls.push(userUpload ? userUpload.url : null);
  }
  try {
    const conversation = await Conversation.create({
      chatName: type == "single" ? null : chatName,
      type: type,
      participants: participants,
      participantsAvatarUrls: participantsAvatarUrls,
    });
    await conversation.save();
    res.status(200).json(conversation);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error Creating Chat", error: error.message });
  }
};

// const getUserChats = async (req, res) => {
//   const userId = req.userId;
//   try {
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     const conversations = await Conversation.find({
//       participants: user.userName,
//     });
//     const conversationsWithChats = await Promise.all(
//       conversations.map(async (conversation) => {
//         const chats = await Chat.find({ _id: { $in: conversation.messages } });
//         const conversationObject = conversation.toObject();
//         conversationObject.messages = chats;
//         return conversationObject;
//       })
//     );
//     return res.status(200).json({ conversations: conversationsWithChats });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Error Fetching Chats", error: error.message });
//   }
// };

const getUserChats = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const conversations = await Conversation.find({
      participants: user.userName,
    });
    const conversationsWithChats = await Promise.all(
      conversations.map(async (conversation) => {
        const chats = await Chat.find({ _id: { $in: conversation.messages } });
        const unreadCount = chats.filter(
          (chat) => chat.isRead === false
        ).length;
        const conversationObject = conversation.toObject();
        conversationObject.messages = chats.map((chat) => {
          const chatObject = chat.toObject();
          chatObject.conversationId = conversation._id;
          return chatObject;
        });
        conversationObject.unreadCount = unreadCount;
        return conversationObject;
      })
    );
    const totalUnreadCount = conversationsWithChats.reduce(
      (total, conversation) => total + conversation.unreadCount,
      0
    );
    return res
      .status(200)
      .json({ conversations: conversationsWithChats, totalUnreadCount });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error Fetching Chats", error: error.message });
  }
};

const markChatAsRead = async (req, res) => {
  const userId = req.userId;
  const conversationId = req.body.conversationId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!conversation.participants.includes(user.userName)) {
      return res.status(401).json({
        message: "You are not a participant in this conversation",
      });
    }
    for (const chatId of conversation.messages) {
      const chat = await Chat.findById(chatId);
      if (chat) {
        if (chat.receiverId.includes(userId)) {
          chat.isRead = true;
          await chat.save();
        }
      }
    }
    // conversation.messages.forEach(async (chatId) => {
    //   const chat = await Chat.findById(chatId);
    //   chat.isRead = true;
    //   await chat.save();
    // });
    res.status(200).json({ message: "Chat Marked as Read" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error Marking Chat as Read", error: error.message });
  }
};
module.exports = {
  createChat,
  getUserChats,
  markChatAsRead,
};
