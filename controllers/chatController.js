const Chat = require("../models/chat");
const User = require("../models/user");
const Conversation = require("../models/conversation");
const { getReceiverSocketId, io } = require("../socket/socket.js");

const sendMessage = async (req, res) => {
  const userId = req.userId;
  const receiverName = req.body.receiverName;
  const chatName = req.body.chatName;
  const type = req.body.type;
  const message = req.body.message;
  try {
    // const { message } = req.body;
    // const { id: receiverId } = req.params;
    // const senderId = req.user._id;

    let conversation = await Conversation.findOne({ chatName: chatName });
    if (!conversation) {
      return res
        .status(404)
        .json({ message: "No Conversation was found with that name" });
    }

    const sender = await User.findById(userId);
    if (!sender) {
      return res
        .status(404)
        .json({ message: "No user was found with that id (Sender)" });
    }

    const receiver = await User.findOne({ userName: receiverName });
    if (!receiver) {
      return res
        .status(404)
        .json({ message: "No user was found with that name (Receiver)" });
    }
    const newMessage = await Chat.create({
      senderId: userId,
      senderName: sender.userName,
      receiverId: receiver._id,
      receiverName: receiver.userName,
      type: type,
      message: message,
    });
    await newMessage.save();

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await conversation.save();

    // this will run in parallel
    // await Promise.all([conversation.save(), newMessage.save()]);

    // SOCKET IO FUNCTIONALITY WILL GO HERE
    const receiverSocketId = getReceiverSocketId(receiver._id);
    if (receiverSocketId) {
      // io.to(<socket_id>).emit() used to send events to specific client
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res
      .status(200)
      .json({ message: "Message Sent Successfully", chatMessage: newMessage });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending Message", message: error.message });
  }
};

// const getMessages = async (req, res) => {
//   try {
//     const { id: userToChatId } = req.params;
//     const senderId = req.user._id;

//     const conversation = await Conversation.findOne({
//       participants: { $all: [senderId, userToChatId] },
//     }).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

//     if (!conversation) return res.status(200).json([]);

//     const messages = conversation.messages;

//     res.status(200).json(messages);
//   } catch (error) {
//     console.log("Error in getMessages controller: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
module.exports = {
  sendMessage,
};
