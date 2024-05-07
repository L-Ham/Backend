// getProfileSettings.test.js
const User = require("../../models/user");
const userController = require("../../controllers/userController");
const mongoose = require("mongoose");

describe('getProfileSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get user profile settings', async () => {
    const userId = new mongoose.Types.ObjectId('000000000000000000000005');
    const req = { userId: userId.toString() };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUser = {
        _id: userId,
        profileSettings: {
          displayName: 'Test User',
          about: 'About Test User',
          avatarImage: 'avatar.jpg',
          bannerImage: 'banner.jpg',
          NSFW: false,
          allowFollow: true,
          contentVisibility: true,
          communitiesVisibility: true,
          clearHistory: false,
        },
        socialLinks: 'socialLinks',
        get: function(prop) {
          if (prop === 'profileSettings') {
            return this.profileSettings;
          }
          return this[prop];
        }
      };
      
      User.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });

    await userController.getProfileSettings(req, res);
    expect(User.findById).toHaveBeenCalledWith(userId.toString());
    expect(res.json).toHaveBeenCalledWith({
      profileSettings: {
        displayName: 'Test User',
        about: 'About Test User',
        socialLinks: 'socialLinks',
        avatarImage: 'avatar.jpg',
        bannerImage: 'banner.jpg',
        NSFW: false,
        allowFollow: true,
        contentVisibility: true,
        communitiesVisibility: true,
        clearHistory: false,
      },
    });
  });

//   it('should handle error if user is not found', async () => {
//     const userId = 'user123';
//     const req = { userId };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     User.findById = jest.fn().mockReturnValue({
//         populate: jest.fn().mockReturnThis(),
//         exec: jest.fn().mockResolvedValue(null),
//       });

//     await userController.getProfileSettings(req, res);

//     expect(User.findById).toHaveBeenCalledWith(userId);
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
//   });

// it('should handle error if there is a problem getting profile settings', async () => {
//     const userId = 'user123';
//     const req = { userId };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
  
//     const error = new Error('Test error');
//     User.findById = jest.fn().mockReturnValue({
//       populate: jest.fn().mockReturnThis(),
//       exec: jest.fn().mockRejectedValueOnce(error),
//     });
  
//     await userController.getProfileSettings(req, res);
  
//     expect(User.findById).toHaveBeenCalledWith(userId);
//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
//   });
});