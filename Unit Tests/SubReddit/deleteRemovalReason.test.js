// subredditController.test.js
const {
  deleteRemovalReason,
} = require("../../controllers/subredditController");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const mongoose = require("mongoose");
jest.mock("../../models/user");
jest.mock("../../models/subReddit");

describe("deleteRemovalReason", () => {
  const reasonId = new mongoose.Types.ObjectId();
  const req = {
    userId: "testUserId",
    body: {
      subredditId: "testSubredditId",
      reasonId: "testReasonId",
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const mockUser = { _id: "testUserId" };
  const mockSubreddit = {
    _id: "testSubredditId",
    moderators: ["testUserId"],
    removalReasons: [
      { _id: "testReasonId", title: "oldTitle", message: "oldMessage" },
    ],
    save: jest.fn(),
  };
  const mockSubreddit2 = {
    _id: "testSubredditId2",
    moderators: ["testUserId"],
    removalReasons: [
      { _id: reasonId, title: "oldTitle", message: "oldMessage" },
    ],
    save: jest.fn(),
  };
  const req2 = {
    userId: "testUserId",
    body: {
      subredditId: "testSubredditId2",
      reasonId: reasonId,
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if user does not exist", async () => {
    User.findById.mockResolvedValue(null);
    await deleteRemovalReason(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 404 if subreddit does not exist", async () => {
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(null);
    await deleteRemovalReason(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it("should return 403 if user is not a moderator of the subreddit", async () => {
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue({ ...mockSubreddit, moderators: [] });
    await deleteRemovalReason(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not a moderator of this subreddit",
    });
  });

  it("should return 404 if removal reason does not exist", async () => {
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue({
      ...mockSubreddit,
      removalReasons: [],
    });
    await deleteRemovalReason(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Removal reason not found",
    });
  });

  it("should delete a removal reason if user is a moderator and reason exists", async () => {
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(mockSubreddit2);
    await deleteRemovalReason(req2, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Removal reason deleted successfully",
    });
  });

  it("should return 500 if an error occurs", async () => {
    User.findById.mockRejectedValue(new Error("Database error"));
    await deleteRemovalReason(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error deleting removal reason",
      error: "Database error",
    });
  });
});
