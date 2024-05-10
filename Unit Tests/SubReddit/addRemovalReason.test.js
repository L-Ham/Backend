// subredditController.test.js
const { addRemovalReason } = require('../../controllers/subredditController');
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
jest.mock('../../models/User');
jest.mock('../../models/SubReddit');

describe('addRemovalReason', () => {
  const req = { 
    userId: 'testUserId', 
    body: { 
      subredditId: 'testSubredditId', 
      title: 'testTitle', 
      message: 'testMessage' 
    } 
  };
  const res = { 
    status: jest.fn().mockReturnThis(), 
    json: jest.fn() 
  };
  const mockUser = { _id: 'testUserId' };
  const mockSubreddit = { 
    _id: 'testSubredditId', 
    moderators: ['testUserId'], 
    removalReasons: [], 
    save: jest.fn() 
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if user does not exist', async () => {
    User.findById.mockResolvedValue(null);
    await addRemovalReason(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it('should return 404 if subreddit does not exist', async () => {
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(null);
    await addRemovalReason(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it('should return 403 if user is not a moderator of the subreddit', async () => {
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue({ ...mockSubreddit, moderators: [] });
    await addRemovalReason(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "You are not a moderator of this subreddit" });
  });

  it('should return 500 if subreddit has reached the limit of 50 removal reasons', async () => {
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue({ ...mockSubreddit, removalReasons: new Array(50).fill({}) });
    await addRemovalReason(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Exceeded limit of 50 Reasons for the subreddit" });
  });

  it('should add a removal reason if user is a moderator and limit is not exceeded', async () => {
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    await addRemovalReason(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Removal reason added successfully" });
  });

  it('should return 500 if an error occurs', async () => {
    User.findById.mockRejectedValue(new Error('Database error'));
    await addRemovalReason(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error adding removal reason", error: 'Database error' });
  });
});