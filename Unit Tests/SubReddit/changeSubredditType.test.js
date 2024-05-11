const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/subreddit", () => ({
  findOne: jest.fn(),
}));

describe('changeSubredditType', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error if ageRestriction or privacyType is not provided', async () => {
    const req = { userId: 'user123', query: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.changeSubredditType(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Age restriction and privacy type are required' });
  });

  it('should return error if privacyType is invalid', async () => {
    const req = { userId: 'user123', query: { ageRestriction: true, privacyType: 'invalid' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.changeSubredditType(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid privacy type' });
  });

  it('should return error if user is not found', async () => {
    const req = { userId: 'user123', query: { ageRestriction: true, privacyType: 'public' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValueOnce(null);

    await subredditController.changeSubredditType(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });


  it('should handle server error', async () => {
    const req = { userId: 'user123', query: { ageRestriction: true, privacyType: 'public' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockRejectedValueOnce(new Error('Some error message'));

    await subredditController.changeSubredditType(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error changing subreddit type', error: 'Some error message' });
  });
});