const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/subReddit", () => ({
  findOne: jest.fn(),
}));

describe("leaveModerator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should leave a moderator successfully", async () => {
    const userId = "user123";
    const subredditName = "subreddit123";
    const user = { _id: userId, communities: [subredditName] };
    const subreddit = {
      _id: subredditName,
      moderators: [userId],
      save: jest.fn(),
    };
    User.findById.mockResolvedValueOnce(user);
    SubReddit.findOne.mockResolvedValueOnce(subreddit);

    const req = { userId, body: { subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.leaveModerator(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(subreddit.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Moderator left successfully",
    });
  });

  it("should return 404 if user is not found", async () => {
    const userId = "user123";
    const subredditName = "subreddit123";

    User.findById.mockResolvedValueOnce(null);

    const req = { userId, body: { subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.leaveModerator(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 404 if subreddit is not found", async () => {
    const userId = "user123";
    const subredditName = "subreddit123";
    const user = { _id: userId };

    User.findById.mockResolvedValueOnce(user);
    SubReddit.findOne.mockResolvedValueOnce(null);

    const req = { userId, body: { subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.leaveModerator(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });
});
