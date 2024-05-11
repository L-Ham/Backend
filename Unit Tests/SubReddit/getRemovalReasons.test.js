// subredditController.test.js
const { getRemovalReasons } = require("../../controllers/subredditController");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
jest.mock("../../models/user");
jest.mock("../../models/subReddit");

describe("getRemovalReasons", () => {
  const req = {
    userId: "testUserId",
    query: {
      subredditId: "testSubredditId",
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
    removalReasons: [{ title: "testTitle", message: "testMessage" }],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if user does not exist", async () => {
    User.findById.mockResolvedValue(null);
    await getRemovalReasons(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 404 if subreddit does not exist", async () => {
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(null);
    await getRemovalReasons(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it("should return 403 if user is not a moderator of the subreddit", async () => {
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue({ ...mockSubreddit, moderators: [] });
    await getRemovalReasons(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not a moderator of this subreddit",
    });
  });

  it("should return removal reasons if user is a moderator", async () => {
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    await getRemovalReasons(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Retrieved subreddit removal reasons",
      removalReasons: mockSubreddit.removalReasons,
    });
  });

  it("should return 500 if an error occurs", async () => {
    User.findById.mockRejectedValue(new Error("Database error"));
    await getRemovalReasons(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error getting removal reasons",
      error: "Database error",
    });
  });
});
