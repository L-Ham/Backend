const SubReddit = require("../../models/subReddit");
const subredditController = require("../../controllers/subredditController");

// Mocking SubReddit.findOne function
jest.mock("../../models/subreddit", () => ({
  findOne: jest.fn(),
}));

describe('checkSubredditNameAvailability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return "Name available" if name is not taken', async () => {
    const name = 'newSubreddit';
    SubReddit.findOne.mockResolvedValueOnce(null);

    const req = { query: { name } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.checkSubredditNameAvailability(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({ name });
    expect(res.json).toHaveBeenCalledWith({ message: 'Name available' });
  });

  it('should return "Name already taken" if name is already taken', async () => {
    const name = 'existingSubreddit';
    const existingSubreddit = { name: 'existingSubreddit' };
    SubReddit.findOne.mockResolvedValueOnce(existingSubreddit);

    const req = { query: { name } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.checkSubredditNameAvailability(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({ name });
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'Name already taken' });
  });

  it('should return "Name is empty" if name is not provided', async () => {
    const req = { query: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.checkSubredditNameAvailability(req, res);

    expect(SubReddit.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Name is empty' });
  });

  it('should handle server error', async () => {
    const name = 'newSubreddit';
    const errorMessage = 'Some error message';
    SubReddit.findOne.mockRejectedValueOnce(new Error(errorMessage));

    const req = { query: { name } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.checkSubredditNameAvailability(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({ name });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
  });
});