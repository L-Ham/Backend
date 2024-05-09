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
    senderAvatarImage = await UserUploadModel.findById(sender.avatarImage);
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
        conversationId: chatId,
        senderId: userId,
        senderName: sender.userName,
        senderAvatar: senderAvatarImage ? senderAvatarImage.url : null,
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
        conversationId: chatId,
        senderId: userId,
        senderName: sender.userName,
        senderAvatar: senderAvatarImage ? senderAvatarImage.url : null,
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
      console.log(receiverIds[0]);
      const receiverSocketId = getReceiverSocketId(receiverIds[0].toString());
      console.log("Ana hsta3ml el socket");
      console.log(receiverSocketId);

      if (receiverSocketId) {
        console.log(receiverSocketId);

        // io.to(<socket_id>).emit() used to send events to specific client
        console.log("Ana hsta3ml el socket");
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    } else if (conversation.type === "group") {
      for (let participant of conversation.participants) {
        if (participant == sender.userName) continue;
        const participantUser = await User.findOne({ userName: participant });
        const participantSocketId = getReceiverSocketId(participantUser._id);
        if (participantSocketId) {
          io.to(participantSocketId).emit("newMessage", newMessage);
        } else {
          console.log("No socket found for participant");
          continue;
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

module.exports = {
  sendMessage,
};
