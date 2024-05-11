const User = require("../../models/user");
const SubReddit = require("../../models/subreddit");
const subredditController = require("../../controllers/subredditController");

// Mocking User.findById and SubReddit.findById functions
jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/subreddit", () => ({
  findById: jest.fn(),
}));

describe('deleteBookmarkButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a bookmark button successfully', async () => {
    const userId = 'user123';
    const subredditId = 'subreddit123';
    const widgetId = 'widget123';
    const buttonId = 'button123';
    const user = { _id: userId };
    const subreddit = {
      _id: subredditId,
      moderators: [userId],
      bookMarks: [
        {
          _id: widgetId,
          buttons: [
            { _id: buttonId },
          ],
        },
      ],
      save: jest.fn(),
    };
    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { userId, body: { subredditId, widgetId, buttonId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.deleteBookmarkButton(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(subreddit.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: "Bookmark button deleted successfully" });
  });
  it('should return 404 if user is not found', async () => {
    const userId = 'user123';
    const subredditId = 'subreddit123';
    const widgetId = 'widget123';
    const buttonId = 'button123';
  
    User.findById.mockResolvedValueOnce(null);
  
    const req = { userId, body: { subredditId, widgetId, buttonId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await subredditController.deleteBookmarkButton(req, res);
  
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
  
  it('should return 404 if subreddit is not found', async () => {
    const userId = 'user123';
    const subredditId = 'subreddit123';
    const widgetId = 'widget123';
    const buttonId = 'button123';
    const user = { _id: userId };
  
    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(null);
  
    const req = { userId, body: { subredditId, widgetId, buttonId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await subredditController.deleteBookmarkButton(req, res);
  
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });
  it('should return 403 if user is not a moderator', async () => {
    const userId = 'user123';
    const subredditId = 'subreddit123';
    const widgetId = 'widget123';
    const buttonId = 'button123';
    const user = { _id: userId };
    const subreddit = {
      _id: subredditId,
      moderators: ['anotherUser'],
      bookMarks: [
        {
          _id: widgetId,
          buttons: [
            { _id: buttonId },
          ],
        },
      ],
      save: jest.fn(),
    };
  
    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(subreddit);
  
    const req = { userId, body: { subredditId, widgetId, buttonId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await subredditController.deleteBookmarkButton(req, res);
  
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "You are not a moderator of this subreddit" });
  });
  
  it('should return 400 if widgetId is not provided', async () => {
    const userId = 'user123';
    const subredditId = 'subreddit123';
    const buttonId = 'button123';
    const user = { _id: userId };
    const subreddit = {
      _id: subredditId,
      moderators: [userId],
      bookMarks: [
        {
          _id: 'widget123',
          buttons: [
            { _id: buttonId },
          ],
        },
      ],
      save: jest.fn(),
    };
  
    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(subreddit);
  
    const req = { userId, body: { subredditId, buttonId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await subredditController.deleteBookmarkButton(req, res);
  
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Widget ID is required" });
  });
  

});