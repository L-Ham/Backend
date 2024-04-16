const User = require("../../models/user");
const userController = require("../../controllers/userController");

User.findById = jest.fn();

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

describe('editProfileSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update user profile settings', async () => {
    const userId = 'user123';
    const req = {
      userId,
      body: {
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
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUser = {
      profileSettings: new Map(),
      save: jest.fn().mockResolvedValueOnce('saved'),
    };

    User.findById.mockResolvedValueOnce(mockUser);

    await userController.editProfileSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(mockUser.profileSettings.get('displayName')).toEqual(req.body.displayName);
    expect(mockUser.profileSettings.get('about')).toEqual(req.body.about);
    expect(mockUser.profileSettings.get('avatarImage')).toEqual(req.body.avatarImage);
    expect(mockUser.profileSettings.get('bannerImage')).toEqual(req.body.bannerImage);
    expect(mockUser.profileSettings.get('NSFW')).toEqual(req.body.NSFW);
    expect(mockUser.profileSettings.get('allowFollow')).toEqual(req.body.allowFollow);
    expect(mockUser.profileSettings.get('contentVisibility')).toEqual(req.body.contentVisibility);
    expect(mockUser.profileSettings.get('communitiesVisibility')).toEqual(req.body.communitiesVisibility);
    expect(mockUser.profileSettings.get('clearHistory')).toEqual(req.body.clearHistory);
    expect(mockUser.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "User profile settings updated successfully",
      user: 'saved',
    });
  });

  it('should handle error if user is not found', async () => {
    const userId = 'user123';
    const req = { userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById.mockResolvedValueOnce(null);

    await userController.editProfileSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should handle error if there is a problem updating profile settings', async () => {
    const userId = 'user123';
    const req = { userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const error = new Error('Test error');
    User.findById.mockRejectedValueOnce(error);

    await userController.editProfileSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error updating profile settings', error: error });
  });
});