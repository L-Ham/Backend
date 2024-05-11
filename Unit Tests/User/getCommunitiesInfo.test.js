const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const UserUploadModel = require("../../models/userUploads");
const userController = require("../../controllers/userController");

describe('getCommunitiesInfo', () => {
    it('should return the communities info of the user', async () => {
        const userId = 'validUserId';
        const req = { userId };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
      
        const user = {
          communities: ['communityId1', 'communityId2'],
          favoriteCommunities: ['communityId1']
        };
      
        const communities = [
          { _id: 'communityId1', name: 'community1', members: ['member1', 'member2'], appearance: { avatarImage: 'avatarImageId1' } },
          { _id: 'communityId2', name: 'community2', members: ['member1'], appearance: { avatarImage: 'avatarImageId2' } }
        ];
      
        const avatarImages = [
          { _id: 'avatarImageId1', url: 'url1' },
          { _id: 'avatarImageId2', url: 'url2' }
        ];
      
        User.findById = jest.fn().mockResolvedValue(user);
        SubReddit.find = jest.fn().mockResolvedValue(communities);
        UserUploadModel.find = jest.fn().mockResolvedValue(avatarImages);
      
        try {
          await userController.getCommunitiesInfo(req, res);
          expect(User.findById).toHaveBeenCalledWith(userId);
          expect(SubReddit.find).toHaveBeenCalledWith({ _id: { $in: user.communities } });
          expect(UserUploadModel.find).toHaveBeenCalledWith({ _id: { $in: communities.map(community => community.appearance.avatarImage) } });
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.json).toHaveBeenCalledWith({ communities: expect.any(Array) });
        } catch (error) {
          expect(res.status).toHaveBeenCalledWith(500);
        }
      });

  it('should return a 404 status code if user is not found', async () => {
    const userId = 'invalidUserId';
    const req = { userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockResolvedValue(null);

    await userController.getCommunitiesInfo(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return a 500 status code if an error occurs', async () => {
    const userId = 'validUserId';
    const req = { userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

    await userController.getCommunitiesInfo(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error retrieving user' });
  });
});