const Chat = require("../models/chat");
const User = require("../models/user");
const Conversation = require("../models/conversation");
const UserUploadModel = require("../models/userUploads");
const UserUpload = require("../controllers/userUploadsController");
const { getReceiverSocketId, io } = require("../socket/socket.js");

const sendMessage = async (req, res) => {
  const userId = req.userId;
  const chatId = req.body.chatId;
  const type = req.body.type;
  const message = req.body.message;
  try {
    let conversation = await Conversation.findOne({ _id: chatId });
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
    let receiver = null;
    let receivers = null;
    if (conversation.type === "single") {
      const participants = conversation.participants;
      const otherParticipants = participants.filter(
        (participant) => participant !== sender.userName
      );
      receivers = await User.find({ userName: { $in: otherParticipants } });

      if (!receivers || receivers.length === 0) {
        return res.status(404).json({
          message: "No other participants were found in this conversation",
        });
      }
    } else if (conversation.type === "group") {
      const participants = conversation.participants;
      const otherParticipants = participants.filter(
        (participant) => participant !== sender.userName
      );
      receivers = await User.find({ userName: { $in: otherParticipants } });

      if (!receivers || receivers.length === 0) {
        return res.status(404).json({
          message: "No other participants were found in this conversation",
        });
      }
    }
    const receiverIds = receivers.map((receiver) => receiver._id);
    const receiverNames = receivers.map((receiver) => receiver.userName);

    let newMessage = null;
    if (type == "text") {
      newMessage = await Chat.create({
        senderId: userId,
        senderName: sender.userName,
        receiverId: receiverIds,
        receiverName: receiverNames,
        type: type,
        message: type == "text" ? message : null,
        imageUrl: null,
        isRead: false,
      });
    } else if (type == "image") {
      if (!req.files) {
        return res.status(400).json({ message: "No file was uploaded" });
      }
      const uploadedImageId = await UserUpload.uploadMedia(req.files[0]);
      console.log(uploadedImageId);
      const messageImage = await UserUploadModel.findById(uploadedImageId);
      newMessage = await Chat.create({
        senderId: userId,
        senderName: sender.userName,
        receiverId: receiverIds,
        receiverName: receiverNames,
        type: type,
        message: null,
        imageUrl: type == "image" ? messageImage.url : null,
        isRead: false,
      });
    }

    await newMessage.save();

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await conversation.save();

    // this will run in parallel
    // await Promise.all([conversation.save(), newMessage.save()]);

    // SOCKET IO FUNCTIONALITY WILL GO HERE
    if (conversation.type === "single") {
      const receiverSocketId = getReceiverSocketId(receiverIds[0]);
      if (receiverSocketId) {
        // io.to(<socket_id>).emit() used to send events to specific client
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    } else if (conversation.type === "group") {
      // io.to(<room_name>).emit() used to send events to all clients in a room
      // io.to(conversation.chatName).emit("newMessage", newMessage);
      for (participant of conversation.participants) {
        if (participant == sender.userName) continue;
        const participantSocketId = getReceiverSocketId(participant);
        if (participantSocketId) {
          io.to(participantSocketId).emit("newMessage", newMessage);
        }
      }
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
