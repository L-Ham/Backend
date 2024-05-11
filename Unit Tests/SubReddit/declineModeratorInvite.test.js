const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const UserUploadModel = require("../../models/userUploads");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/user", () => ({
    find: jest.fn(),
    findById: jest.fn(), 
  }));

jest.mock("../../models/subReddit", () => ({
  findOne: jest.fn(),
}));

jest.mock("../../models/userUploads", () => ({
  findOne: jest.fn(),
}));

describe("declineModeratorInvite", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("should decline moderator invite if user and subreddit exist and user is invited", async () => {
      const subredditName = "subreddit123";
      const userId = "user123";
      const subreddit = { 
        name: subredditName, 
        invitedModerators: [userId],
        save: jest.fn(),
      };
      const user = { _id: userId, userName: "user1" };
  
      User.findById.mockResolvedValueOnce(user);
      SubReddit.findOne.mockResolvedValueOnce(subreddit);
  
      const req = { body: { subredditName }, userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await subredditController.declineModeratorInvite(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
      expect(subreddit.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Moderator declined successfully" });
    });
  
    it("should handle error if user is not found", async () => {
      const subredditName = "subreddit123";
      const userId = "user123";
  
      User.findById.mockResolvedValueOnce(null);
  
      const req = { body: { subredditName }, userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await subredditController.declineModeratorInvite(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  
    it("should handle error if subreddit is not found", async () => {
      const subredditName = "subreddit123";
      const userId = "user123";
      const user = { _id: userId, userName: "user1" };
  
      User.findById.mockResolvedValueOnce(user);
      SubReddit.findOne.mockResolvedValueOnce(null);
  
      const req = { body: { subredditName }, userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await subredditController.declineModeratorInvite(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
    });
  
    it("should handle error if user is not invited", async () => {
      const subredditName = "subreddit123";
      const userId = "user123";
      const subreddit = { 
        name: subredditName, 
        invitedModerators: [],
      };
      const user = { _id: userId, userName: "user1" };
  
      User.findById.mockResolvedValueOnce(user);
      SubReddit.findOne.mockResolvedValueOnce(subreddit);
  
      const req = { body: { subredditName }, userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await subredditController.declineModeratorInvite(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not invited" });
    });
  
    it("should handle server error", async () => {
      const subredditName = "subreddit123";
      const userId = "user123";
      const errorMessage = "Some error message";
  
      User.findById.mockRejectedValueOnce(new Error(errorMessage));
  
      const req = { body: { subredditName }, userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await subredditController.declineModeratorInvite(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error declining moderator invite",
        error: errorMessage,
      });
    });
  });