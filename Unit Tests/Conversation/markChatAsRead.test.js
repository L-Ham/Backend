const conversationController = require("../../controllers/conversationController");
const User = require("../../models/user");
const Conversation = require("../../models/conversation");
const Chat = require("../../models/chat");

jest.mock("../../models/user");
jest.mock("../../models/conversation");
jest.mock("../../models/chat");

describe('markChatAsRead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if user is not found', async () => {
    User.findById.mockResolvedValueOnce(null);

    const req = { userId: '123', body: { conversationId: '456' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await conversationController.markChatAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 404 if conversation is not found', async () => {
    User.findById.mockResolvedValueOnce({});
    Conversation.findById.mockResolvedValueOnce(null);

    const req = { userId: '123', body: { conversationId: '456' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await conversationController.markChatAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Conversation not found' });
  });

  it('should return 401 if user is not a participant in the conversation', async () => {
    User.findById.mockResolvedValueOnce({ userName: 'notParticipant' });
    Conversation.findById.mockResolvedValueOnce({ participants: ['participant'] });

    const req = { userId: '123', body: { conversationId: '456' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await conversationController.markChatAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'You are not a participant in this conversation' });
  });

  it('should mark the chat as read successfully', async () => {
    User.findById.mockResolvedValueOnce({ userName: 'participant' });
    Conversation.findById.mockResolvedValueOnce({ participants: ['participant'], messages: ['789'] });
    Chat.findById.mockResolvedValueOnce({ receiverId: ['123'], isRead: false, save: jest.fn() });

    const req = { userId: '123', body: { conversationId: '456' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await conversationController.markChatAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Chat Marked as Read' });
  });

  it('should return 500 if there is an error marking the chat as read', async () => {
    User.findById.mockImplementationOnce(() => {
      throw new Error('Error Marking Chat as Read');
    });

    const req = { userId: '123', body: { conversationId: '456' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await conversationController.markChatAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error Marking Chat as Read', error: 'Error Marking Chat as Read' });
  });
});