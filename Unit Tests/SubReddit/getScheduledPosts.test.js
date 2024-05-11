const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const UserUploadModel = require("../../models/userUploads");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/user", () => ({
    findById: jest.fn(),
  }));
  
  jest.mock("../../models/subReddit", () => ({
    findById: jest.fn(),
  }));
  
jest.mock("../../models/userUploads", () => ({
  findOne: jest.fn(),
}));

describe("getScheduledPosts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("should get scheduled posts if user and subreddit exist and user is a moderator", async () => {
      const subredditId = "subreddit123";
      const userId = "user123";
      const scheduledPosts = [{ user: userId, post: "post1" }];
      const subreddit = { 
        _id: subredditId, 
        name: "subredditName",
        moderators: [userId],
        scheduledPosts: scheduledPosts,
      };
      const user = { _id: userId, userName: "user1" };
  
      User.findById.mockResolvedValueOnce(user).mockResolvedValueOnce(user);
      SubReddit.findById.mockResolvedValueOnce(subreddit);
  
      const req = { query: { subredditId }, userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await subredditController.getScheduledPosts(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Retrieved scheduled posts",
        scheduledPosts: [
          {
            ...scheduledPosts[0],
            subredditName: subreddit.name,
            userName: user.userName,
          },
        ],
      });
    });
  
    it("should handle error if user is not found", async () => {
      const subredditId = "subreddit123";
      const userId = "user123";
  
      User.findById.mockResolvedValueOnce(null);
  
      const req = { query: { subredditId }, userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await subredditController.getScheduledPosts(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  
    it("should handle error if subreddit is not found", async () => {
      const subredditId = "subreddit123";
      const userId = "user123";
      const user = { _id: userId, userName: "user1" };
  
      User.findById.mockResolvedValueOnce(user);
      SubReddit.findById.mockResolvedValueOnce(null);
  
      const req = { query: { subredditId }, userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await subredditController.getScheduledPosts(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
    });
  
    it("should handle error if user is not a moderator", async () => {
      const subredditId = "subreddit123";
      const userId = "user123";
      const subreddit = { 
        _id: subredditId, 
        name: "subredditName",
        moderators: [],
      };
      const user = { _id: userId, userName: "user1" };
  
      User.findById.mockResolvedValueOnce(user);
      SubReddit.findById.mockResolvedValueOnce(subreddit);
  
      const req = { query: { subredditId }, userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await subredditController.getScheduledPosts(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "You are not a moderator" });
    });
  
    it("should handle error if no scheduled posts are found", async () => {
      const subredditId = "subreddit123";
      const userId = "user123";
      const subreddit = { 
        _id: subredditId, 
        name: "subredditName",
        moderators: [userId],
        scheduledPosts: [],
      };
      const user = { _id: userId, userName: "user1" };
  
      User.findById.mockResolvedValueOnce(user);
      SubReddit.findById.mockResolvedValueOnce(subreddit);
  
      const req = { query: { subredditId }, userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await subredditController.getScheduledPosts(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No scheduled posts found" });
    });
  
    it("should handle server error", async () => {
      const subredditId = "subreddit123";
      const userId = "user123";
      const errorMessage = "Some error message";
  
      User.findById.mockRejectedValueOnce(new Error(errorMessage));
  
      const req = { query: { subredditId }, userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await subredditController.getScheduledPosts(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error getting scheduledposts",
        error: errorMessage,
      });
    });
  });