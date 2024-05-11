const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/subReddit", () => ({
  findById: jest.fn(),
}));


describe('editBookmarkButton', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should edit a bookmark button successfully', async () => {
      const userId = 'user123';
      const subredditId = 'subreddit123';
      const widgetId = 'widget123';
      const buttonId = 'button123';
      const label = 'new label';
      const link = 'new link';
      const user = { _id: userId };
      const subreddit = { 
        moderators: [userId],
        bookMarks: [{
          _id: widgetId,
          buttons: [{
            _id: buttonId,
            label: 'old label',
            link: 'old link'
          }]
        }],
        save: jest.fn(),
      };
      User.findById.mockResolvedValueOnce(user);
      SubReddit.findById.mockResolvedValueOnce(subreddit);
  
      const req = { userId, body: { subredditId, widgetId, buttonId, label, link } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await subredditController.editBookmarkButton(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
      expect(subreddit.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Bookmark button edited successfully",
        button: subreddit.bookMarks[0].buttons[0],
      });
    });
    it('should return 404 if user not found', async () => {
        const userId = 'user123';
        const subredditId = 'subreddit123';
        const widgetId = 'widget123';
        const buttonId = 'button123';
        const label = 'new label';
        const link = 'new link';
      
        User.findById.mockResolvedValueOnce(null);
      
        const req = { userId, body: { subredditId, widgetId, buttonId, label, link } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
      
        await subredditController.editBookmarkButton(req, res);
      
        expect(User.findById).toHaveBeenCalledWith(userId);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
      });
      
      it('should return 404 if subreddit not found', async () => {
        const userId = 'user123';
        const subredditId = 'subreddit123';
        const widgetId = 'widget123';
        const buttonId = 'button123';
        const label = 'new label';
        const link = 'new link';
        const user = { _id: userId };
      
        User.findById.mockResolvedValueOnce(user);
        SubReddit.findById.mockResolvedValueOnce(null);
      
        const req = { userId, body: { subredditId, widgetId, buttonId, label, link } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
      
        await subredditController.editBookmarkButton(req, res);
      
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
        const label = 'new label';
        const link = 'new link';
        const user = { _id: userId };
        const subreddit = { 
          moderators: ['anotherUser'],
          bookMarks: [{
            _id: widgetId,
            buttons: [{
              _id: buttonId,
              label: 'old label',
              link: 'old link'
            }]
          }],
          save: jest.fn(),
        };
      
        User.findById.mockResolvedValueOnce(user);
        SubReddit.findById.mockResolvedValueOnce(subreddit);
      
        const req = { userId, body: { subredditId, widgetId, buttonId, label, link } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
      
        await subredditController.editBookmarkButton(req, res);
      
        expect(User.findById).toHaveBeenCalledWith(userId);
        expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "You are not a moderator of this subreddit" });
      });
      
      it('should return 400 if widgetId is not provided', async () => {
        const userId = 'user123';
        const subredditId = 'subreddit123';
        const buttonId = 'button123';
        const label = 'new label';
        const link = 'new link';
        const user = { _id: userId };
        const subreddit = { 
          moderators: [userId],
          bookMarks: [{
            _id: 'widget123',
            buttons: [{
              _id: buttonId,
              label: 'old label',
              link: 'old link'
            }]
          }],
          save: jest.fn(),
        };
      
        User.findById.mockResolvedValueOnce(user);
        SubReddit.findById.mockResolvedValueOnce(subreddit);
      
        const req = { userId, body: { subredditId, buttonId, label, link } };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
      
        await subredditController.editBookmarkButton(req, res);
      
        expect(User.findById).toHaveBeenCalledWith(userId);
        expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Widget ID is required" });
      });
  
  });