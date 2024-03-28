const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const userController = require("../../controllers/userController");

// // Mocking User.findById function
// jest.mock("../../models/user", () => ({
//   findById: jest.fn(),
// }));



describe('addFavoriteCommunity', () => {

    // User and community exist, user is a member of the community, community is not already favorited
    it('should add favorite community when all conditions are met', async () => {
      const req = {
        userId: 'validUserId',
        body: {
          subRedditId: 'validCommunityId'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const user = {
        favoriteCommunities: [],
        communities: ['validCommunityId'],
        save: jest.fn()
      };
      const community = {
        _id: 'validCommunityId'
      };

      User.findById = jest.fn().mockResolvedValue(user);
      SubReddit.findById = jest.fn().mockResolvedValue(community);

      await userController.addFavoriteCommunity(req, res);

      expect(User.findById).toHaveBeenCalledWith('validUserId');
      expect(SubReddit.findById).toHaveBeenCalledWith('validCommunityId');
      expect(user.favoriteCommunities).toContain('validCommunityId');
      expect(user.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Community favorited successfully',
        community
      });
    });

    // User ID is not valid
    it('should return error when user ID is not valid', async () => {
      const req = {
        userId: 'invalidUserId',
        body: {
          subRedditId: 'validCommunityId'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findById = jest.fn().mockResolvedValue(null);

      await userController.addFavoriteCommunity(req, res);

      expect(User.findById).toHaveBeenCalledWith('invalidUserId');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    // User and community exist, user is a member of the community, community is already favorited
    it('should return an error message when the community is already favorited', async () => {
      const req = {
        userId: 'validUserId',
        body: {
          subRedditId: 'validCommunityId'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const user = {
        favoriteCommunities: ['validCommunityId'],
        communities: ['validCommunityId'],
      };
      const community = {
        _id: 'validCommunityId',
        name: 'Test Community'
      };

      User.findById = jest.fn().mockResolvedValue(user);
      SubReddit.findById = jest.fn().mockResolvedValue(community);

      await userController.addFavoriteCommunity(req, res);

      expect(User.findById).toHaveBeenCalledWith('validUserId');
      expect(SubReddit.findById).toHaveBeenCalledWith('validCommunityId');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Community already favorited by user' });
    });

    // User and community exist, user is not a member of the community
    it('should return an error message when the user is not a member of the community', async () => {
      const req = {
        userId: 'validUserId',
        body: {
          subRedditId: 'validCommunityId'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const user = {
        favoriteCommunities: [],
        communities: [],
      };
      const community = {
        _id: 'validCommunityId',
        name: 'Test Community',
      };

      User.findById = jest.fn().mockResolvedValue(user);
      SubReddit.findById = jest.fn().mockResolvedValue(community);

      await userController.addFavoriteCommunity(req, res);

      expect(User.findById).toHaveBeenCalledWith('validUserId');
      expect(SubReddit.findById).toHaveBeenCalledWith('validCommunityId');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User is not a member of this community' });
    });

    // Community ID is not valid
    it('should return an error message when the community ID is not valid', async () => {
      const req = {
        userId: 'validUserId',
        body: {
          subRedditId: 'invalidCommunityId'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const user = {
        favoriteCommunities: [],
        communities: ['validCommunityId'],
      };

      User.findById = jest.fn().mockResolvedValue(user);
      SubReddit.findById = jest.fn().mockResolvedValue(null);

      await userController.addFavoriteCommunity(req, res);

      expect(User.findById).toHaveBeenCalledWith('validUserId');
      expect(SubReddit.findById).toHaveBeenCalledWith('invalidCommunityId');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Community not found' });
    });
});
