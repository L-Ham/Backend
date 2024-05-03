const Conversation = require("../models/conversation");
const User = require("../models/user");

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
  try {
    const conversation = await Conversation.create({
      chatName,
      type,
      participants,
    });
    await conversation.save();
    res.status(200).json(conversation);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error Creating Chat", error: error.message });
  }
};

const getUserChats = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const conversations = await Conversation.find({
      participants: userId,
    }).populate("messages");
    return res.status(200).json({ conversations });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error Fetching Chats", error: error.message });
  }
};
module.exports = {
  createChat,
  getUserChats,
};
