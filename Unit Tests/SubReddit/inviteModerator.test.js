const User = require("../../models/user");
const SubReddit = require("../../models/subreddit");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock("../../models/subreddit", () => ({
  findOne: jest.fn(),
}));

describe('inviteModerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should invite a moderator successfully', async () => {
    const userId = 'user123';
    const invitedModeratorUsername = 'moderator123';
    const subredditName = 'subreddit123';
    const user = { _id: userId };
    const invitedModerator = { _id: 'moderator123' };
    const subreddit = {
      name: subredditName,
      moderators: [],
      invitedModerators: [],
      save: jest.fn(),
    };
    User.findById.mockResolvedValueOnce(user);
    SubReddit.findOne.mockResolvedValueOnce(subreddit);
    User.findOne.mockResolvedValueOnce(invitedModerator);

    const req = { userId, body: { invitedModeratorUsername, subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.inviteModerator(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(User.findOne).toHaveBeenCalledWith({ userName: invitedModeratorUsername });
    expect(subreddit.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: "Moderator invited successfully" });
  });

  it('should return 404 if user is not found', async () => {
    const userId = 'user123';
    const invitedModeratorUsername = 'moderator123';
    const subredditName = 'subreddit123';

    User.findById.mockResolvedValueOnce(null);

    const req = { userId, body: { invitedModeratorUsername, subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.inviteModerator(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it('should return 404 if subreddit is not found', async () => {
    const userId = 'user123';
    const invitedModeratorUsername = 'moderator123';
    const subredditName = 'subreddit123';
    const user = { _id: userId };

    User.findById.mockResolvedValueOnce(user);
    SubReddit.findOne.mockResolvedValueOnce(null);

    const req = { userId, body: { invitedModeratorUsername, subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.inviteModerator(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });


  it('should return 400 if user is already a moderator', async () => {
    const userId = 'user123';
    const invitedModeratorUsername = 'moderator123';
    const subredditName = 'subreddit123';
    const user = { _id: userId };
    const invitedModerator = { _id: 'moderator123' };
    const subreddit = { name: subredditName, moderators: [invitedModerator._id] };

    User.findById.mockResolvedValueOnce(user);
    SubReddit.findOne.mockResolvedValueOnce(subreddit);
    User.findOne.mockResolvedValueOnce(invitedModerator);

    const req = { userId, body: { invitedModeratorUsername, subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.inviteModerator(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(User.findOne).toHaveBeenCalledWith({ userName: invitedModeratorUsername });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User is already a moderator" });
  });
});