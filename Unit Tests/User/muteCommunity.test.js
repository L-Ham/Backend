const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const userController = require("../../controllers/userController");

describe('muteCommunity', () => {
  it('should mute a community and return the updated user', async () => {
    const communityToMute = { _id: 'communityToMuteId', name: 'communityToMute', appearance: { avatarImage: 'avatar.png' } };
    const user = { _id: 'userId', muteCommunities: [], save: jest.fn() };
    const communityName = 'communityToMute';
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
    SubReddit.findOne = jest.fn().mockResolvedValue(communityToMute);

    await userController.muteCommunity(req, res);
  });

  it('should return a 404 status code if community to mute is not found', async () => {
    const communityName = 'communityToMute';
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

    await userController.muteCommunity(req, res);
  });

  it('should return a 400 status code if community is already muted', async () => {
    const communityToMute = { _id: 'communityToMuteId', name: 'communityToMute', appearance: { avatarImage: 'avatar.png' } };
    const user = { _id: 'userId', muteCommunities: [{ mutedCommunityId: 'communityToMuteId' }], save: jest.fn() };
    const communityName = 'communityToMute';
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
    SubReddit.findOne = jest.fn().mockResolvedValue(communityToMute);

    await userController.muteCommunity(req, res);
  });

  it('should return a 500 status code if an error occurs', async () => {
    const communityName = 'communityToMute';
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

    await userController.muteCommunity(req, res);
  });
});