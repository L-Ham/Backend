const { approveUser } = require('../../controllers/subredditController');
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const mongoose = require('mongoose');
jest.mock('../../models/User');
jest.mock('../../models/SubReddit');

describe('approveUser', () => {
  const mockUser = { 
    _id: 'testUserId', 
    userName: 'testUser', 
    communities: [], 
    save: jest.fn() 
  };
  const mockSubreddit = { 
    _id: 'testSubredditId', 
    name: 'testSubreddit', 
    privacy: 'private',
    moderators: ['testUserId'],
    members: [],
    pendingMembers: ['testUserId'],
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
    await approveUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it('should return 400 if subreddit is not private', async () => {
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
    SubReddit.findOne.mockResolvedValue({ ...mockSubreddit, privacy: 'public' });
    await approveUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit is not private Anyone Can Join" });
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
    await approveUser(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "You are not a moderator" });
  });

  it('should return 404 if user to be approved does not exist', async () => {
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
    await approveUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it('should return 400 if user to be approved is already a member', async () => {
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
    SubReddit.findOne.mockResolvedValue({ ...mockSubreddit, members: ['testUserId'] });
    User.findOne.mockResolvedValue(mockUser);
    await approveUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User already a member" });
  });

  it('should return 400 if user to be approved is not in pending members', async () => {
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
    SubReddit.findOne.mockResolvedValue({ ...mockSubreddit, pendingMembers: [] });
    User.findOne.mockResolvedValue(mockUser);
    await approveUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User not in pending members" });
  });

  it('should approve user successfully', async () => {
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
    await approveUser(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: "User approved successfully" });
  });
});