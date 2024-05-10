const messageController = require('../../controllers/messageController');
const User = require('../../models/user');
const Message = require('../../models/message');
const SubReddit = require('../../models/subReddit');

jest.mock('../../models/user');
jest.mock('../../models/message');
jest.mock('../../models/subReddit');
describe('getUnreadInboxMessages', () => {
    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);
  
      const req = {
        userId: '123'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await messageController.getUnreadInboxMessages(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  
    it('should return 500 if no unread inbox messages', async () => {
      User.findById.mockResolvedValue({});
      Message.find.mockResolvedValue([]);
  
      const req = {
        userId: '123'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await messageController.getUnreadInboxMessages(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'No Unread Messages' });
    });
  
    it('should return all unread inbox messages', async () => {
      User.findById.mockResolvedValue({});
      Message.find.mockResolvedValue([{
        _id: '456',
        sender: '789',
        receiver: '123',
        subject: 'Test',
        message: 'Test message',
        isRead: false,
        createdAt: new Date(),
        replies: [],
        parentMessageId: null
      }]);
  
      const req = {
        userId: '123'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await messageController.getUnreadInboxMessages(req, res);
  
      expect(res.json).toHaveBeenCalled();
    });
  
    it('should return 500 if there is an error', async () => {
      User.findById.mockRejectedValue(new Error('Test error'));
  
      const req = {
        userId: '123'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await messageController.getUnreadInboxMessages(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error getting Unread Inbox messages', error: 'Test error' });
    });
  });