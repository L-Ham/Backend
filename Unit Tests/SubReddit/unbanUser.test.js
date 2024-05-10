// subredditController.test.js
const { unbanUser } = require('../../controllers/subredditController');
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const mongoose = require('mongoose');
jest.mock('../../models/User');
jest.mock('../../models/SubReddit');

describe('unbanUser', () => {
  const mockUser = { 
    _id: 'testUserId', 
    userName: 'testUser', 
    communities: ['testSubredditId'], 
    bannedSubreddits: ['testSubredditId'], 
    save: jest.fn() 
  };
  const mockSubreddit = { 
    _id: 'testSubredditId', 
    name: 'testSubreddit', 
    moderators: ['testUserId'], 
    bannedUsers: [{ userId: 'testUserId', modNote: '', reasonForBan: '' }], 
    save: jest.fn() 
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if subreddit does not exist', async () => {
    const req = { 
      userId: 'testUserId', 
      body: { 
        subredditName: 'nonexistentSubreddit', 
        userName: 'testUser'
      } 
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    SubReddit.findOne.mockResolvedValue(null);
    await unbanUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it('should return 403 if user is not a moderator of the subreddit', async () => {
    const req = { 
      userId: 'nonModeratorUserId', 
      body: { 
        subredditName: 'testSubreddit', 
        userName: 'testUser'
      } 
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    SubReddit.findOne.mockResolvedValue(mockSubreddit);
    await unbanUser(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "You are not a moderator" });
  });

  it('should return 404 if user to be unbanned does not exist', async () => {
    const req = { 
      userId: 'testUserId', 
      body: { 
        subredditName: 'testSubreddit', 
        userName: 'nonexistentUser'
      } 
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    SubReddit.findOne.mockResolvedValue(mockSubreddit);
    User.findOne.mockResolvedValue(null);
    await unbanUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it('should return 400 if user to be unbanned is not banned', async () => {
    const req = { 
      userId: 'testUserId', 
      body: { 
        subredditName: 'testSubreddit', 
        userName: 'testUser'
      } 
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    SubReddit.findOne.mockResolvedValue({ ...mockSubreddit, bannedUsers: [] });
    User.findOne.mockResolvedValue(mockUser);
    await unbanUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User not banned" });
  });

  it('should unban a user if they are banned', async () => {
    const req = { 
      userId: 'testUserId', 
      body: { 
        subredditName: 'testSubreddit', 
        userName: 'testUser'
      } 
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    SubReddit.findOne.mockResolvedValue(mockSubreddit);
    User.findOne.mockResolvedValue(mockUser);
    await unbanUser(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: "User unbanned successfully" });
  });

  it('should return 500 if an error occurs', async () => {
    const req = { 
      userId: 'testUserId', 
      body: { 
        subredditName: 'testSubreddit', 
        userName: 'testUser'
      } 
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    SubReddit.findOne.mockRejectedValue(new Error('Database error'));
    await unbanUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error unbanning user" });
  });
});