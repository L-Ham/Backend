const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/subReddit", () => ({
  findById: jest.fn(),
}));

describe("getSubredditRules", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return subreddit rules if user and subreddit exist", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";
    const user = { _id: userId };
    const subreddit = { rules: ["Rule 1", "Rule 2"] };

    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { userId, body: { subredditId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getSubredditRules(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.json).toHaveBeenCalledWith({
      message: "Subreddit rules retrieved successfully",
      rules: subreddit.rules,
    });
  });

  it("should handle error if user is not found", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";

    User.findById.mockResolvedValueOnce(null);

    const req = { userId, body: { subredditId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getSubredditRules(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should handle error if subreddit is not found", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";
    const user = { _id: userId };

    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(null);

    const req = { userId, body: { subredditId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getSubredditRules(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it("should handle server error", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";
    const errorMessage = "Some error message";
    const user = { _id: userId };

    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockRejectedValueOnce(new Error(errorMessage));

    const req = { userId, body: { subredditId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getSubredditRules(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: errorMessage,
      message: "Error getting subreddit rules",
    });
  });
});
