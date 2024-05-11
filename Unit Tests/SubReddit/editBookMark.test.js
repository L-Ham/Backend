const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/subReddit", () => ({
  findById: jest.fn(),
}));

describe("editBookmark", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should edit a bookmark successfully", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";
    const widgetId = "widget123";
    const widgetName = "New Widget Name";
    const description = "New Description";

    const user = { _id: userId };
    const bookmark = {
      _id: widgetId,
      widgetName: "Old Widget Name",
      description: "Old Description",
    };
    const subreddit = {
      _id: subredditId,
      moderators: [userId],
      bookMarks: [bookmark],
      save: jest.fn(),
    };

    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = {
      userId,
      body: { subredditId, widgetId, widgetName, description },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.editBookmark(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(subreddit.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Bookmark edited successfully",
      bookmark: { _id: widgetId, widgetName, description },
    });
  });
  it("should return 404 if user is not found", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";
    const widgetId = "widget123";

    User.findById.mockResolvedValueOnce(null);

    const req = { userId, body: { subredditId, widgetId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.editBookmark(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 404 if subreddit is not found", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";
    const widgetId = "widget123";

    const user = { _id: userId };

    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(null);

    const req = { userId, body: { subredditId, widgetId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.editBookmark(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });
  it("should return 403 if user is not a moderator", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";
    const widgetId = "widget123";

    const user = { _id: userId };
    const subreddit = {
      _id: subredditId,
      moderators: ["anotherUser"],
      bookMarks: [],
    };

    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { userId, body: { subredditId, widgetId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.editBookmark(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not a moderator of this subreddit",
    });
  });

  it("should return 400 if widgetId is not provided", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";

    const user = { _id: userId };
    const subreddit = {
      _id: subredditId,
      moderators: [userId],
      bookMarks: [],
    };

    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { userId, body: { subredditId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.editBookmark(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Widget ID is required" });
  });
  it("should return 404 if bookmark is not found", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";
    const widgetId = "widget123";

    const user = { _id: userId };
    const subreddit = {
      _id: subredditId,
      moderators: [userId],
      bookMarks: [],
      save: jest.fn(),
    };

    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { userId, body: { subredditId, widgetId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.editBookmark(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Bookmark not found" });
  });

  it("should return 500 if there is a server error", async () => {
    const userId = "user123";
    const subredditId = "subreddit123";
    const widgetId = "widget123";

    User.findById.mockRejectedValueOnce(new Error("Server error"));

    const req = { userId, body: { subredditId, widgetId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.editBookmark(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error editing bookmark",
      error: "Server error",
    });
  });
});
