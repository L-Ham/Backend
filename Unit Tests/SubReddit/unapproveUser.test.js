// UnapproveUser.test.js
const { UnapproveUser } = require('../../controllers/subredditController');
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const mongoose=require('mongoose');

jest.mock('../../models/User');
jest.mock('../../models/SubReddit');

describe('UnapproveUser', () => {
  const mockUser = { 
    _id: 'testUserId', 
    userName: 'testUser', 
    communities: ['testSubredditId'], 
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
    await UnapproveUser(req, res);
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
    await UnapproveUser(req, res);
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
    await UnapproveUser(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "You are not a moderator" });
  });

  it('should return 404 if user to be unapproved does not exist', async () => {
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
    await UnapproveUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it('should return 400 if user to be unapproved is not in pending members', async () => {
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
    await UnapproveUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User not in pending members" });
  });

  it('should unapprove user successfully', async () => {
    testUserId=new mongoose.Types.ObjectId(1);
    const req = { 
      userId: 'testUserId', 
      body: { 
        subredditName: 'testSubreddit', 
        userName: 'testUser2'
      } 
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
  
      class MockArray extends Array {
        constructor(...args) {
            super(...args);
        }
    
        pull = jest.fn().mockImplementation((id) => {
            const index = this.indexOf(id);
            if (index > -1) {
                this.splice(index, 1);
            }
        });
    
        includes = jest.fn().mockImplementation((id) => {
            return super.includes(id);
        });
    }
    const mockUser2 = { 
        _id: testUserId, 
        userName: 'testUser2', 
        communities: new MockArray('testSubredditId'), 
        save: jest.fn() 
    };
    const mockSubreddit2 = { 
        _id: 'testSubredditId', 
        name: 'testSubreddit', 
        privacy: 'private',
        moderators: ['testUserId'],
        members: [],
        pendingMembers: new MockArray(testUserId),
        save: jest.fn() 
    };
    SubReddit.findOne.mockResolvedValue(mockSubreddit2);
    User.findOne.mockResolvedValue(mockUser2);
    await UnapproveUser(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: "User unapproved successfully" });
  });
});