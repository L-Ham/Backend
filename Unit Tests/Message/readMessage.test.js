const messageController = require('../../controllers/messageController');
const User = require('../../models/user');
const Message = require('../../models/message');
const SubReddit = require('../../models/subReddit');

jest.mock('../../models/user');
jest.mock('../../models/message');
jest.mock('../../models/subReddit');

describe('readMessage', () => {
    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);
  
      const req = {
        userId: '123',
        body: { messageId: '456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await messageController.readMessage(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  
    it('should return 404 if message not found', async () => {
      User.findById.mockResolvedValue({});
      Message.findById.mockResolvedValue(null);
  
      const req = {
        userId: '123',
        body: { messageId: '456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await messageController.readMessage(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Message not found' });
    });
  
    it('should return 403 if user is not the receiver of the message', async () => {
      User.findById.mockResolvedValue({ _id: '123' });
      Message.findById.mockResolvedValue({ receiver: '789' });
  
      const req = {
        userId: '123',
        body: { messageId: '456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await messageController.readMessage(req, res);
  
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized You are not the message receiver' });
    });
  
    it('should return 400 if message is already read', async () => {
      User.findById.mockResolvedValue({ _id: '123' });
      Message.findById.mockResolvedValue({ receiver: '123', isRead: true });
  
      const req = {
        userId: '123',
        body: { messageId: '456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await messageController.readMessage(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Message already read' });
    });
  
    it('should mark the message as read', async () => {
      const saveMock = jest.fn();
      User.findById.mockResolvedValue({ _id: '123' });
      Message.findById.mockResolvedValue({ receiver: '123', isRead: false, save: saveMock });
  
      const req = {
        userId: '123',
        body: { messageId: '456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await messageController.readMessage(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Message Marked as Read' });
      expect(saveMock).toHaveBeenCalled();
    });
  
    it('should return 500 if there is an error', async () => {
      User.findById.mockRejectedValue(new Error('Test error'));
  
      const req = {
        userId: '123',
        body: { messageId: '456' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await messageController.readMessage(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });