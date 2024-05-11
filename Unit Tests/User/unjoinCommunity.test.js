const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const userController = require("../../controllers/userController");

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
  save: jest.fn(),
}));

jest.mock("../../models/subReddit", () => ({
  findById: jest.fn(),
  save: jest.fn(),
}));

describe("unjoinCommunity", () => {
    it("should return 404 if user is not found", async () => {
      User.findById.mockResolvedValueOnce(null);
  
      const req = { userId: "user123", body: { subRedditId: "community123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await userController.unjoinCommunity(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  
    it("should return 404 if community is not found", async () => {
      User.findById.mockResolvedValueOnce({});
      SubReddit.findById.mockResolvedValueOnce(null);
  
      const req = { userId: "user123", body: { subRedditId: "community123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await userController.unjoinCommunity(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Community not found" });
    });
  
    it("should return 404 if community is not found", async () => {
        User.findById.mockResolvedValueOnce({});
        SubReddit.findById.mockResolvedValueOnce(null);
      
        const req = { userId: "user123", body: { subRedditId: "community123" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
        await userController.unjoinCommunity(req, res);
      
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Community not found" });
      });
      
      it("should return 400 if community is private and user is not a member or pending", async () => {
        User.findById.mockResolvedValueOnce({ _id: "user123", communities: [] });
        SubReddit.findById.mockResolvedValueOnce({
          _id: "community123",
          privacy: "private",
          members: [],
          pendingMembers: [],
          save: jest.fn(),
        });
      
        const req = { userId: "user123", body: { subRedditId: "community123" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
        await userController.unjoinCommunity(req, res);
      
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: "User is not pending or a member of this community",
        });
      });
      
      it("should return 400 if community is public and user is not a member", async () => {
        User.findById.mockResolvedValueOnce({ _id: "user123", communities: [] });
        SubReddit.findById.mockResolvedValueOnce({
          _id: "community123",
          privacy: "public",
          members: [],
          save: jest.fn(),
        });
      
        const req = { userId: "user123", body: { subRedditId: "community123" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
        await userController.unjoinCommunity(req, res);
      
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: "User is not a member of this community",
        });
      });
      
      it("should return 500 if there is an error unjoining community", async () => {
        User.findById.mockImplementationOnce(() => {
          throw new Error("Test error");
        });
      
        const req = { userId: "user123", body: { subRedditId: "community123" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
        await userController.unjoinCommunity(req, res);
      
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Error unjoining community",
          error: expect.any(Error),
        });
      });
  });