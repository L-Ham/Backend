const SubReddit = require("../../models/subReddit");
const User = require("../../models/user");
const UserUploadModel = require("../../models/userUploads");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/subReddit", () => ({
  findOne: jest.fn(),
}));

jest.mock("../../models/user", () => ({
  find: jest.fn(),
}));

jest.mock("../../models/userUploads", () => ({
  findOne: jest.fn(),
}));

describe('getBannedUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve banned users successfully', async () => {
    const userId = 'user123';
    const subredditName = 'testSubreddit';
    const subreddit = {
      name: subredditName,
      moderators: [userId],
      bannedUsers: [{
        userId: 'bannedUser123',
        avatarImage: 'image123',
      }],
    };
    const bannedUser = {
      _id: 'bannedUser123',
      userName: 'bannedUser',
      avatarImage: 'image123',
    };
    const userUpload = {
      url: 'http://example.com/image.jpg',
    };
    SubReddit.findOne.mockResolvedValueOnce(subreddit);
    User.find.mockResolvedValueOnce([bannedUser]);
    UserUploadModel.findOne.mockResolvedValueOnce(userUpload);

    const req = { userId, query: { subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getBannedUsers(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(User.find).toHaveBeenCalledWith({ _id: { $in: subreddit.bannedUsers.map(bannedUser => bannedUser.userId) } });
    expect(UserUploadModel.findOne).toHaveBeenCalledWith({ _id: bannedUser.avatarImage });
    expect(res.json).toHaveBeenCalledWith({
      message: "Retrieved subreddit Banned Users Successfully",
      bannedUsers: [{
        _id: bannedUser._id,
        userName: bannedUser.userName,
        avatarImage: userUpload.url,
      }],
    });
  });

  it('should return 404 if subreddit is not found', async () => {
    const userId = 'user123';
    const subredditName = 'testSubreddit';
    SubReddit.findOne.mockResolvedValueOnce(null);

    const req = { userId, query: { subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getBannedUsers(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it('should return 403 if user is not a moderator', async () => {
    const userId = 'user123';
    const subredditName = 'testSubreddit';
    const subreddit = {
      name: subredditName,
      moderators: ['otherUser123'],
    };
    SubReddit.findOne.mockResolvedValueOnce(subreddit);

    const req = { userId, query: { subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getBannedUsers(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "You are not a moderator" });
  });

  it('should handle server error', async () => {
    const userId = 'user123';
    const subredditName = 'testSubreddit';
    const errorMessage = 'Some error message';
    SubReddit.findOne.mockRejectedValueOnce(new Error(errorMessage));

    const req = { userId, query: { subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getBannedUsers(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error getting subreddit Banned Users", error: errorMessage });
  });
  
  it('should return an empty array if User.find returns no users', async () => {
    const userId = 'user123';
    const subredditName = 'testSubreddit';
    const subreddit = {
      name: subredditName,
      moderators: [userId],
      bannedUsers: [{
        userId: 'bannedUser123',
        avatarImage: 'image123',
      }],
    };
    SubReddit.findOne.mockResolvedValueOnce(subreddit);
    User.find.mockResolvedValueOnce([]);
  
    const req = { userId, query: { subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await subredditController.getBannedUsers(req, res);
  
    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(User.find).toHaveBeenCalledWith({ _id: { $in: subreddit.bannedUsers.map(bannedUser => bannedUser.userId) } });
    expect(res.json).toHaveBeenCalledWith({
      message: "Retrieved subreddit Banned Users Successfully",
      bannedUsers: [],
    });
  });
});