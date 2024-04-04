const User = require("../../models/user");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const subReddit = require("../../models/subReddit");
const userController = require("../../controllers/userController");
User.findById = jest.fn();


describe('muteCommunity', () => {

    // Successfully mute a community for a user
    it('should successfully mute a community for a user when all conditions are met', async () => {
      const req = {
        userId: 'user123',
        body: {
          subRedditId: 'community123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const user = {
        _id: 'user123',
        muteCommunities: []
      };

      const community = {
        _id: 'community123'
      };

      User.findById = jest.fn().mockResolvedValue(user);
      subReddit.findById = jest.fn().mockResolvedValue(community);
      user.save = jest.fn().mockResolvedValue(user);

      await userController.muteCommunity(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(subReddit.findById).toHaveBeenCalledWith('community123');
      expect(user.muteCommunities).toContain('community123');
      expect(user.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Community muted successfully",
        user
      });
    });

    // Handle errors when finding the user or community by ID
    it('should handle errors when finding the user or community by ID', async () => {
      const req = {
        userId: 'user123',
        body: {
          subRedditId: 'community123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };


      User.findById = jest.fn().mockRejectedValue(new Error('User not found'));
      subReddit.findById = jest.fn().mockRejectedValue(new Error('Community not found'));

      await userController.muteCommunity(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(subReddit.findById).toHaveBeenCalledWith('community123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Error muting community for user", error: new Error('User not found') });
    });

    // Return a JSON response with a success message and the updated user object
    it('should return a JSON response with a success message and the updated user object when all conditions are met', async () => {
      const req = {
        userId: 'user123',
        body: {
          subRedditId: 'community123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const user = {
        _id: 'user123',
        muteCommunities: []
      };

      const community = {
        _id: 'community123'
      };

      User.findById = jest.fn().mockResolvedValue(user);
      subReddit.findById = jest.fn().mockResolvedValue(community);
      user.save = jest.fn().mockResolvedValue(user);

      await userController.muteCommunity(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(subReddit.findById).toHaveBeenCalledWith('community123');
      expect(user.muteCommunities).toContain('community123');
      expect(user.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Community muted successfully",
        user
      });
    });

    // Return a 404 status code if the user is not found
    it('should return a 404 status code if the user is not found', async () => {
      const req = {
        userId: 'user123',
        body: {
          subRedditId: 'community123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findById = jest.fn().mockResolvedValue(null);

      await userController.muteCommunity(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    // Return a 400 status code if the community is already muted by the user
    it('should return a 400 status code if the community is already muted by the user', async () => {
      const req = {
        userId: 'user123',
        body: {
          subRedditId: 'community123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const user = {
        _id: 'user123',
        muteCommunities: ['community123']
      };

      const community = {
        _id: 'community123'
      };

      User.findById = jest.fn().mockResolvedValue(user);
      subReddit.findById = jest.fn().mockResolvedValue(community);

      await userController.muteCommunity(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(subReddit.findById).toHaveBeenCalledWith('community123');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Community already muted" });
    });
});
