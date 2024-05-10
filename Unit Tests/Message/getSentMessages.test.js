const messageController = require('../../controllers/messageController');
const User = require('../../models/user');
const Message = require('../../models/message');
const SubReddit = require('../../models/subReddit');

jest.mock('../../models/user');
jest.mock('../../models/message');
jest.mock('../../models/subReddit');
describe('getSentMessages', () => {
    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);
  
      const req = {
        userId: '123'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await messageController.getSentMessages(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  
    it('should return 500 if no sent messages', async () => {
      User.findById.mockResolvedValue({});
      Message.find.mockResolvedValue([]);
  
      const req = {
        userId: '123'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await messageController.getSentMessages(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'No Sent Messages' });
    });
  
    it('should return all sent messages', async () => {
      User.findById.mockResolvedValue({});
      Message.find.mockResolvedValue([{
        _id: '456',
        sender: '123',
        receiver: '789',
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
  
      await messageController.getSentMessages(req, res);
  
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
  
      await messageController.getSentMessages(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error getting sent messages', error: 'Test error' });
    });
  });