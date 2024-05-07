const User = require("../../models/user");
const userController = require("../../controllers/userController");

describe('getProfileSettings', () => {
    it('should return profile settings when user is found', async () => {
      const userId = 'validUserId';
      const user = {
        profileSettings: new Map([
          ['displayName', 'John Doe'],
          ['about', 'Lorem ipsum'],
          ['avatarImage', 'avatar.jpg'],
          ['bannerImage', 'banner.jpg'],
          ['NSFW', false],
          ['allowFollow', true],
          ['contentVisibility', 'public'],
          ['communitiesVisibility', 'private'],
          ['clearHistory', true]
        ]),
        socialLinks: ['link1', 'link2']
      };
      const req = { userId };
      const res = {
        json: jest.fn()
      };
  
      User.findById = jest.fn().mockResolvedValue(user);
  
      await userController.getProfileSettings(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith({
        profileSettings: {
          displayName: 'John Doe',
          about: 'Lorem ipsum',
          socialLinks: ['link1', 'link2'],
          avatarImage: 'avatar.jpg',
          bannerImage: 'banner.jpg',
          NSFW: false,
          allowFollow: true,
          contentVisibility: 'public',
          communitiesVisibility: 'private',
          clearHistory: true
        }
      });
    });
  
    it('should return a 404 status code if user is not found', async () => {
      const userId = 'invalidUserId';
      const req = { userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findById = jest.fn().mockResolvedValue(null);
  
      await userController.getProfileSettings(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  
    it('should return a 500 status code if there is a error', async () => {
      const userId = 'validUserId';
      const req = { userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    
      User.findById = jest.fn().mockRejectedValue('Server error');
    
      try {
        await userController.getProfileSettings(req, res);
      } catch (error) {
        // Handle the error
      }
    
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });