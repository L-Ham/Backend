const chatController = require("../../controllers/chatController.js");
const User = require("../../models/user.js");
const Chat = require("../../models/chat.js");
const Conversation = require("../../models/conversation.js");
const UserUploadModel = require("../../models/userUploads.js");
const UserUpload = require("../../controllers/userUploadsController.js");
const socket = require("../../socket/socket.js");

jest.mock("../../models/user");
jest.mock("../../models/chat");
jest.mock("../../models/conversation");
jest.mock("../../models/userUploads");
jest.mock("../../controllers/userUploadsController");
jest.mock("../../socket/socket.js");

describe('sendMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle error if conversation is not found', async () => {
    const req = { userId: 'user123', body: { chatId: 'chat123', type: 'text', message: 'Hello' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Conversation.findOne.mockResolvedValueOnce(null);

    await chatController.sendMessage(req, res);

    expect(Conversation.findOne).toHaveBeenCalledWith({ _id: req.body.chatId });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'No Conversation was found with that name' });
  });

  it('should handle error if sender is not found', async () => {
    const req = { userId: 'user123', body: { chatId: 'chat123', type: 'text', message: 'Hello' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Conversation.findOne.mockResolvedValueOnce({ _id: 'chat123' });
    User.findById.mockResolvedValueOnce(null);
  
    await chatController.sendMessage(req, res);
  
    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'No user was found with that id (Sender)' });
  });
  
  it('should handle error if there are no other participants in the conversation', async () => {
    const req = { userId: 'user123', body: { chatId: 'chat123', type: 'text', message: 'Hello' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Conversation.findOne.mockResolvedValueOnce({ _id: 'chat123', type: 'single', participants: ['user123'] });
    User.findById.mockResolvedValueOnce({ _id: 'user123', userName: 'user123' });
  
    await chatController.sendMessage(req, res);
  
    expect(User.find).toHaveBeenCalledWith({ userName: { $in: [] } });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'No other participants were found in this conversation' });
  });
  
  it('should handle error if no file is uploaded for an image message', async () => {
    const req = { userId: 'user123', body: { chatId: 'chat123', type: 'image', message: 'Hello' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Conversation.findOne.mockResolvedValueOnce({ _id: 'chat123', type: 'single', participants: ['user123', 'user456'] });
    User.findById.mockResolvedValueOnce({ _id: 'user123', userName: 'user123' });
    User.find.mockResolvedValueOnce([{ _id: 'user456', userName: 'user456' }]);
  
    await chatController.sendMessage(req, res);
  
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'No file was uploaded' });
  });
  
  it('should handle server error', async () => {
    const req = { userId: 'user123', body: { chatId: 'chat123', type: 'text', message: 'Hello' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const errorMessage = 'Server error';
    Conversation.findOne.mockRejectedValueOnce(new Error(errorMessage));
  
    await chatController.sendMessage(req, res);
  
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error sending Message', message: errorMessage });
  });
  it('should send a text message successfully', async () => {
    const req = { userId: 'user123', body: { chatId: 'chat123', type: 'text', message: 'Hello' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const conversation = { _id: 'chat123', type: 'single', participants: ['user123', 'user456'], messages: [], save: jest.fn() };
    const sender = { _id: 'user123', userName: 'user123', avatarImage: 'image123' };
    const receiver = { _id: 'user456', userName: 'user456' };
    const newMessage = { _id: 'message123', save: jest.fn() };
    Conversation.findOne.mockResolvedValueOnce(conversation);
    User.findById.mockResolvedValueOnce(sender);
    UserUploadModel.findById.mockResolvedValueOnce({ url: 'image_url' });
    User.find.mockResolvedValueOnce([receiver]);
    Chat.create.mockResolvedValueOnce(newMessage);
  
    await chatController.sendMessage(req, res);
  
    expect(Chat.create).toHaveBeenCalledWith({
      conversationId: req.body.chatId,
      senderId: req.userId,
      senderName: sender.userName,
      senderAvatar: 'image_url',
      receiverId: [receiver._id],
      receiverName: [receiver.userName],
      type: req.body.type,
      message: req.body.message,
      imageUrl: null,
      isRead: false,
    });
    expect(newMessage.save).toHaveBeenCalled();
    expect(conversation.messages).toContain(newMessage._id);
    expect(conversation.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Message Sent Successfully', chatMessage: newMessage });
  });
  
  it('should send an image message successfully', async () => {
    const req = { userId: 'user123', body: { chatId: 'chat123', type: 'image', message: 'Hello' }, files: [{}] };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const conversation = { _id: 'chat123', type: 'single', participants: ['user123', 'user456'], messages: [], save: jest.fn() };
    const sender = { _id: 'user123', userName: 'user123', avatarImage: 'image123' };
    const receiver = { _id: 'user456', userName: 'user456' };
    const newMessage = { _id: 'message123', save: jest.fn() };
    Conversation.findOne.mockResolvedValueOnce(conversation);
    User.findById.mockResolvedValueOnce(sender);
    UserUploadModel.findById.mockResolvedValueOnce({ url: 'image_url' });
    User.find.mockResolvedValueOnce([receiver]);
    UserUpload.uploadMedia.mockResolvedValueOnce('uploadedImageId');
    UserUploadModel.findById.mockResolvedValueOnce({ url: 'uploaded_image_url' });
    Chat.create.mockResolvedValueOnce(newMessage);
  
    await chatController.sendMessage(req, res);
  
    expect(UserUpload.uploadMedia).toHaveBeenCalledWith(req.files[0]);
    expect(Chat.create).toHaveBeenCalledWith({
      conversationId: req.body.chatId,
      senderId: req.userId,
      senderName: sender.userName,
      senderAvatar: 'image_url',
      receiverId: [receiver._id],
      receiverName: [receiver.userName],
      type: req.body.type,
      message: null,
      imageUrl: 'uploaded_image_url',
      isRead: false,
    });
    expect(newMessage.save).toHaveBeenCalled();
    expect(conversation.messages).toContain(newMessage._id);
    expect(conversation.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Message Sent Successfully', chatMessage: newMessage });
  });
});