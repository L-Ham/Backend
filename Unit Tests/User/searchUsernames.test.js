const User = require("../../models/user");
const UserUploadModel = require("../../models/userUploads");
const userController = require("../../controllers/userController");

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
  find: jest.fn(),
}));

jest.mock("../../models/userUploads", () => ({
  findById: jest.fn(),
}));

describe('searchUsernames', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return matching usernames', async () => {
    const userId = 'user123';
    const search = 'test';
    const user = {
      blockUsers: [],
    };
    const matchingUser = {
      _id: 'user456',
      userName: 'testUser',
      avatarImage: 'image123',
      profileSettings: {},
      _doc: {},
    };
    const avatarImage = {
      url: 'http://example.com/image.jpg',
    };
    User.findById.mockResolvedValueOnce(user);
    User.find.mockResolvedValueOnce([matchingUser]);
    UserUploadModel.findById.mockResolvedValueOnce(avatarImage);

    const req = { userId, query: { search } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.searchUsernames(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(User.find).toHaveBeenCalledWith({
      userName: new RegExp(`^${search}`, "i"),
      _id: { $ne: userId },
    }, "_id userName avatarImage profileSettings");
    expect(UserUploadModel.findById).toHaveBeenCalledWith(matchingUser.avatarImage);
    expect(res.json).toHaveBeenCalledWith({
      matchingUsernames: [{
        ...matchingUser._doc,
        avatarImageUrl: avatarImage.url,
        isBlocked: false,
      }],
    });
  });

  it('should handle error if user is not found', async () => {
    const userId = 'user123';
    const search = 'test';
    User.findById.mockResolvedValueOnce(null);

    const req = { userId, query: { search } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.searchUsernames(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should handle server error', async () => {
    const userId = 'user123';
    const search = 'test';
    const errorMessage = 'Some error message';
    User.findById.mockRejectedValueOnce(new Error(errorMessage));

    const req = { userId, query: { search } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.searchUsernames(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error searching usernames', error: errorMessage });
  });
});