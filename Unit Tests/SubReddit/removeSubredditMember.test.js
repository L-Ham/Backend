const subredditController = require("../../controllers/subredditController");
const SubReddit = require("../../models/subReddit");
const User = require("../../models/user");

describe("removeSubredditMember", () => {
  it("should return a 404 status code if subreddit is not found", async () => {
    const req = {
      body: { userName: "username", subredditName: "subredditName" },
      userId: "userId",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    SubReddit.findOne = jest.fn().mockResolvedValue(null);

    await subredditController.removeSubredditMember(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({
      name: req.body.subredditName,
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it("should return a 403 status code if user is not a moderator", async () => {
    const req = {
      body: { userName: "username", subredditName: "subredditName" },
      userId: "userId",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const subreddit = {
      moderators: ["anotherUserId"],
    };

    SubReddit.findOne = jest.fn().mockResolvedValue(subreddit);

    await subredditController.removeSubredditMember(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({
      name: req.body.subredditName,
    });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not a moderator",
    });
  });

  it("should return a 404 status code if user is not found", async () => {
    const req = {
      body: { userName: "username", subredditName: "subredditName" },
      userId: "userId",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const subreddit = {
      moderators: ["userId"],
    };

    SubReddit.findOne = jest.fn().mockResolvedValue(subreddit);
    User.findOne = jest.fn().mockResolvedValue(null);

    await subredditController.removeSubredditMember(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: req.body.userName });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return a 400 status code if user is not a member of the subreddit", async () => {
    const req = {
      body: { userName: "username", subredditName: "subredditName" },
      userId: "userId",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const subreddit = {
      moderators: ["userId"],
      members: ["anotherUserId"],
    };

    const user = {
      _id: "userId",
      userName: "username",
    };

    SubReddit.findOne = jest.fn().mockResolvedValue(subreddit);
    User.findOne = jest.fn().mockResolvedValue(user);

    await subredditController.removeSubredditMember(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User not a member" });
  });

  it("should return a 200 status code if user is successfully removed from the subreddit", async () => {
    const req = {
      body: { userName: "username", subredditName: "subredditName" },
      userId: "userId",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const subreddit = {
      _id: "subredditId",
      moderators: ["userId"],
      members: ["userId"],
      save: jest.fn(),
    };

    const user = {
      _id: "userId",
      userName: "username",
      communities: ["subredditId"],
      save: jest.fn(),
    };

    SubReddit.findOne = jest.fn().mockResolvedValue(subreddit);
    User.findOne = jest.fn().mockResolvedValue(user);

    await subredditController.removeSubredditMember(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Subreddit member removed successfully",
    });
  });

  it("should return a 500 status code if an error occurs", async () => {
    const req = {
      body: { userName: "username", subredditName: "subredditName" },
      userId: "userId",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const error = new Error("An error occurred");

    SubReddit.findOne = jest.fn().mockRejectedValue(error);

    await subredditController.removeSubredditMember(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error removing subreddit member",
      error: error.message,
    });
  });
});
