const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const userController = require("../../controllers/userController");
describe('unmuteCommunity', () => {
    it('should unmute a community and return the updated user', async () => {
      const communityToUnmute = { _id: 'communityToUnmuteId', name: 'communityToUnmute', appearance: { avatarImage: 'avatar.png' } };
      const user = { _id: 'userId', muteCommunities: [{ mutedCommunityId: 'communityToUnmuteId' }], save: jest.fn() };
      const communityName = 'communityToUnmute';
      const userId = 'validUserId';
      const req = {
        body: { subRedditName: communityName },
        userId
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findById = jest.fn().mockResolvedValue(user);
      SubReddit.findOne = jest.fn().mockResolvedValue(communityToUnmute);
  
      await userController.unmuteCommunity(req, res);
    });
  
    it('should return a 404 status code if community to unmute is not found', async () => {
      const communityName = 'communityToUnmute';
      const userId = 'validUserId';
      const req = {
        body: { subRedditName: communityName },
        userId
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findById = jest.fn().mockResolvedValue({});
      SubReddit.findOne = jest.fn().mockResolvedValue(null);
  
      await userController.unmuteCommunity(req, res);
    });
  
    it('should return a 404 status code if community is not muted', async () => {
      const communityToUnmute = { _id: 'communityToUnmuteId', name: 'communityToUnmute', appearance: { avatarImage: 'avatar.png' } };
      const user = { _id: 'userId', muteCommunities: [], save: jest.fn() };
      const communityName = 'communityToUnmute';
      const userId = 'validUserId';
      const req = {
        body: { subRedditName: communityName },
        userId
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findById = jest.fn().mockResolvedValue(user);
      SubReddit.findOne = jest.fn().mockResolvedValue(communityToUnmute);
  
      await userController.unmuteCommunity(req, res);
    });
  
    it('should return a 500 status code if an error occurs', async () => {
      const communityName = 'communityToUnmute';
      const userId = 'validUserId';
      const req = {
        body: { subRedditName: communityName },
        userId
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findById = jest.fn().mockRejectedValue(new Error('Database error'));
  
      await userController.unmuteCommunity(req, res);
    });
  });