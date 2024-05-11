// subredditController.test.js
const { banUser } = require("../../controllers/subredditController");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const mongoose = require("mongoose");
jest.mock("../../models/user");
jest.mock("../../models/subReddit");

describe("banUser", () => {
  const mockUser = {
    _id: "testUserId",
    userName: "testUser",
    communities: ["testSubredditId"],
    bannedSubreddits: [],
    save: jest.fn(),
  };
  const mockSubreddit = {
    _id: "testSubredditId",
    name: "testSubreddit",
    moderators: ["testUserId"],
    bannedUsers: [],
    save: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if subreddit does not exist", async () => {
    const req = {
      userId: "testUserId",
      body: {
        subredditName: "nonexistentSubreddit",
        userName: "testUser",
        reasonForBan: "testReason",
        modNote: "testNote",
        permanent: true,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    SubReddit.findOne.mockResolvedValue(null);
    await banUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it("should return 403 if user is not a moderator of the subreddit", async () => {
    const req = {
      userId: "nonModeratorUserId",
      body: {
        subredditName: "testSubreddit",
        userName: "testUser",
        reasonForBan: "testReason",
        modNote: "testNote",
        permanent: true,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    SubReddit.findOne.mockResolvedValue(mockSubreddit);
    await banUser(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not a moderator",
    });
  });

  it("should return 404 if user to be banned does not exist", async () => {
    const req = {
      userId: "testUserId",
      body: {
        subredditName: "testSubreddit",
        userName: "nonexistentUser",
        reasonForBan: "testReason",
        modNote: "testNote",
        permanent: true,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    SubReddit.findOne.mockResolvedValue(mockSubreddit);
    User.findOne.mockResolvedValue(null);
    await banUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 400 if user to be banned is not a member of the subreddit", async () => {
    const req = {
      userId: "testUserId",
      body: {
        subredditName: "testSubreddit",
        userName: "nonMemberUser",
        reasonForBan: "testReason",
        modNote: "testNote",
        permanent: true,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    SubReddit.findOne.mockResolvedValue(mockSubreddit);
    User.findOne.mockResolvedValue({ ...mockUser, communities: [] });
    await banUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User is not a member of this subreddit",
    });
  });

  it("should return 400 if user tries to ban themselves", async () => {
    const req = {
      userId: "testUserId",
      body: {
        subredditName: "testSubreddit",
        userName: "testUser",
        reasonForBan: "testReason",
        modNote: "testNote",
        permanent: true,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    SubReddit.findOne.mockResolvedValue(mockSubreddit);
    User.findOne.mockResolvedValue(mockUser);
    await banUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "You can't ban yourself",
    });
  });

  it("should ban a user if they are not already banned", async () => {
    const mockUser2 = {
      _id: "testUserId2",
      userName: "testUser2",
      communities: ["testSubredditId"],
      bannedSubreddits: [],
      save: jest.fn(),
    };

    const req = {
      userId: "testUserId",
      body: {
        subredditName: "testSubreddit",
        userName: "testUser2",
        reasonForBan: "testReason",
        modNote: "testNote",
        permanent: true,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    SubReddit.findOne.mockResolvedValue(mockSubreddit);
    User.findOne.mockResolvedValue(mockUser);
    User.findOne.mockResolvedValue(mockUser2);
    await banUser(req, res);
    expect(res.json).toHaveBeenCalledWith({
      message: "User banned successfully",
    });
  });

  it("should return 500 if an error occurs", async () => {
    const req = {
      userId: "testUserId",
      body: {
        subredditName: "testSubreddit",
        userName: "testUser",
        reasonForBan: "testReason",
        modNote: "testNote",
        permanent: true,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    SubReddit.findOne.mockRejectedValue(new Error("Database error"));
    await banUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error banning user" });
  });
});
