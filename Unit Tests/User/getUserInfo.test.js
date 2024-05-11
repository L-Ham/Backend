const User = require("../../models/user");
const UserUploadModel = require("../../models/userUploads");
const userController = require("../../controllers/userController");

describe('getUserInfo', () => {
  it('should return user info if user is found', async () => {
    const userId = 'validUserId';
    const req = {
      userId,
      query: {
        userId: 'otherValidUserId'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      _id: 'validUserId',
      following: [],
      blockUsers: [],
    };

    const otherUser = {
      _id: 'otherValidUserId',
      profileSettings: new Map(),
      userName: 'username',
      upvotedComments: [],
      downvotedComments: [],
      createdAt: new Date(),
      upvotedPosts: [],
      downvotedPosts: [],
      socialLinks: [],
    };

    User.findById = jest.fn()
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(otherUser);

    UserUploadModel.findById = jest.fn().mockResolvedValue(null);

    await userController.getUserInfo(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(User.findById).toHaveBeenCalledWith(req.query.userId);
    expect(res.json).toHaveBeenCalledWith({
      user: expect.objectContaining({
        userId: otherUser._id,
        username: otherUser.userName,
      })
    });
  });

  it('should return a 404 status code if user is not found', async () => {
    const userId = 'invalidUserId';
    const req = {
      userId,
      query: {
        userId: 'otherValidUserId'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockResolvedValue(null);

    await userController.getUserInfo(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return a 404 status code if other user is not found', async () => {
    const userId = 'validUserId';
    const req = {
      userId,
      query: {
        userId: 'invalidUserId'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      _id: 'validUserId',
      following: [],
      blockUsers: [],
    };

    User.findById = jest.fn()
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null);

    await userController.getUserInfo(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(User.findById).toHaveBeenCalledWith(req.query.userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User Displayed not found' });
  });

  it('should return a 500 status code if an error occurs', async () => {
    const userId = 'validUserId';
    const req = {
      userId,
      query: {
        userId: 'otherValidUserId'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockRejectedValue(new Error());

    await userController.getUserInfo(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error retrieving user' });
  });
});