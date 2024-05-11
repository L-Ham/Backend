const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/subReddit", () => ({
  findById: jest.fn(),
}));

describe('addBookmarkButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a bookmark button successfully', async () => {
    const userId = 'user123';
    const subredditId = 'subreddit123';
    const widgetId = 'widget123';
    const button = { label: 'test', link: 'test.com' };
    const user = { _id: userId };
    const subreddit = { 
      _id: subredditId, 
      moderators: [userId],
      bookMarks: [{ _id: widgetId, buttons: [] }],
      save: jest.fn(),
    };
    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { userId, body: { subredditId, widgetId, button } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.addBookmarkButton(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(subreddit.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: "Bookmark button added successfully", button });
  });

  it('should return 404 if user is not found', async () => {
    const userId = 'user123';
    const subredditId = 'subreddit123';
    const widgetId = 'widget123';
    const button = { label: 'test', link: 'test.com' };
  
    User.findById.mockResolvedValueOnce(null);
  
    const req = { userId, body: { subredditId, widgetId, button } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await subredditController.addBookmarkButton(req, res);
  
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
  
  it('should return 404 if subreddit is not found', async () => {
    const userId = 'user123';
    const subredditId = 'subreddit123';
    const widgetId = 'widget123';
    const button = { label: 'test', link: 'test.com' };
  
    const user = { _id: userId };
  
    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(null);
  
    const req = { userId, body: { subredditId, widgetId, button } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await subredditController.addBookmarkButton(req, res);
  
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });
  
  // Test case when user is not a moderator
  it('should return 403 if user is not a moderator', async () => {
    const userId = 'user123';
    const subredditId = 'subreddit123';
    const widgetId = 'widget123';
    const button = { label: 'test', link: 'test.com' };
  
    const user = { _id: userId };
    const subreddit = { 
      _id: subredditId, 
      moderators: [],
      bookMarks: [{ _id: widgetId, buttons: [] }],
    };
  
    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(subreddit);
  
    const req = { userId, body: { subredditId, widgetId, button } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await subredditController.addBookmarkButton(req, res);
  
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "You are not a moderator of this subreddit" });
  });

  

  
  
  
});