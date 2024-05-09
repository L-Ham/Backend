const messageController = require('../../controllers/messageController');
const User = require('../../models/user');
const Message = require('../../models/message');

jest.mock('../../models/user');
jest.mock('../../models/message');

describe('unsendMessage', () => {
  it('should return 404 if user not found', async () => {
    User.findById.mockResolvedValue(null);

    const req = {
      userId: '123',
      body: {
        messageId: '456'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await messageController.unsendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 404 if message not found', async () => {
    User.findById.mockResolvedValue({});
    Message.findById.mockResolvedValue(null);

    const req = {
      userId: '123',
      body: {
        messageId: '456'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await messageController.unsendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Message not found' });
  });

  it('should return 403 if user is not the message sender', async () => {
    User.findById.mockResolvedValue({});
    Message.findById.mockResolvedValue({
      sender: '789'
    });

    const req = {
      userId: '123',
      body: {
        messageId: '456'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await messageController.unsendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized You are not the message sender' });
  });

  it('should delete the message and return 200', async () => {
    User.findById.mockResolvedValue({});
    Message.findById.mockResolvedValue({
      sender: '123'
    });
    Message.deleteOne.mockResolvedValue({});

    const req = {
      userId: '123',
      body: {
        messageId: '456'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await messageController.unsendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Message Deleted' });
  });

  it('should return 500 if there is an error', async () => {
    User.findById.mockRejectedValue(new Error('Test error'));

    const req = {
      userId: '123',
      body: {
        messageId: '456'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await messageController.unsendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error Deleting Message', error: 'Test error' });
  });
});