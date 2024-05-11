const { getUserChats } = require('../../controllers/conversationController');
const User = require('../../models/user');
const Conversation = require('../../models/conversation');
const Chat = require('../../models/chat');

jest.mock('../../models/user');
jest.mock('../../models/conversation');
jest.mock('../../models/chat');

describe('getUserChats', () => {
  const req = { userId: '123' };
  const res = {
    status: jest.fn(function() {
      return this;
    }),
    json: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if user is not found', async () => {
    User.findById.mockResolvedValue(null);

    await getUserChats(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should return 200 with empty array if no conversations found', async () => {
    User.findById.mockResolvedValue({ userName: 'test' });
    Conversation.find.mockResolvedValue([]);

    await getUserChats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ conversations: [], totalUnreadCount: 0 });
  });

  it('should return 200 with conversations if conversations found', async () => {
    User.findById.mockResolvedValue({ userName: 'test' });
    Conversation.find.mockResolvedValue([{ messages: ['1', '2'], toObject: () => ({}) }]);
    Chat.find.mockResolvedValue([{ isRead: false, toObject: () => ({}) }]);

    await getUserChats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it('should return 500 if error occurs', async () => {
    User.findById.mockRejectedValue(new Error('Test error'));

    await getUserChats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error Fetching Chats', error: 'Test error' });
  });
});