const messageController = require('../../controllers/messageController');
const User = require('../../models/user');
const Message = require('../../models/message');
const SubReddit = require('../../models/subReddit');

jest.mock('../../models/user');
jest.mock('../../models/message');
jest.mock('../../models/subReddit');

describe('composeMessage', () => {
  it('should return 404 if user not found', async () => {
    User.findById.mockResolvedValue(null);

    const req = {
      userId: '123',
      body: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await messageController.composeMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 404 if subreddit not found and isSubreddit is true', async () => {
    User.findById.mockResolvedValue({});
    SubReddit.findOne.mockResolvedValue(null);

    const req = {
      userId: '123',
      body: {
        receiverName: 'subreddit',
        isSubreddit: true
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await messageController.composeMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Subreddit not found' });
  });

  it('should return 404 if receiver not found and isSubreddit is false', async () => {
    User.findById.mockResolvedValue({});
    User.findOne.mockResolvedValue(null);

    const req = {
      userId: '123',
      body: {
        receiverName: 'user',
        isSubreddit: false
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await messageController.composeMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Receiver not found' });
  });



it('should send a message to a subreddit', async () => {
    User.findById.mockResolvedValue({});
    SubReddit.findOne.mockResolvedValue({ moderators: ['moderator'] });
    Message.findById.mockResolvedValue(null);
    const saveMock = jest.fn();
    Message.mockImplementation(() => ({ save: saveMock }));
  
    const req = {
      userId: '123',
      body: {
        receiverName: 'subreddit',
        isSubreddit: true
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  
    await messageController.composeMessage(req, res);
  
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Message sent' });
    expect(saveMock).toHaveBeenCalled();
  });
  
  it('should send a message to a user', async () => {
    User.findById.mockResolvedValue({});
    User.findOne.mockResolvedValue({ _id: '789' });
    Message.findById.mockResolvedValue(null);
    const saveMock = jest.fn();
    Message.mockImplementation(() => ({ save: saveMock }));
  
    const req = {
      userId: '123',
      body: {
        receiverName: 'user',
        isSubreddit: false
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  
    await messageController.composeMessage(req, res);
  
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Message sent' });
    expect(saveMock).toHaveBeenCalled();
  });
  
  it('should return 500 if there is an error', async () => {
    User.findById.mockRejectedValue(new Error('Test error'));
  
    const req = {
      userId: '123',
      body: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  
    await messageController.composeMessage(req, res);
  
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Test error' });
  });
});