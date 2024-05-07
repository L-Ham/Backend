// getAllBlockedUsers.test.js
const User = require("../../models/user");
const userController = require("../../controllers/userController");
const mongoose = require("mongoose");

describe('getAllBlockedUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all blocked users', async () => {
    const userId = new mongoose.Types.ObjectId('000000000000000000000005');
    const req = { userId: userId.toString() };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUser = new User({
      _id: userId,
      blockUsers: [
        {
          _id: new mongoose.Types.ObjectId('000000000000000000000006'),
          blockedUserName: 'Blocked User',
          blockedUserAvatar: 'avatar.jpg',
        },
      ],
    });

    User.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
      }),
    });
    console.log(req);
    await userController.getAllBlockedUsers(req, res);
    expect(User.findById).toHaveBeenCalledWith(userId.toString());
    expect(res.json).toHaveBeenCalledWith({
      message: "Blocked users list returned successfully",
      blockedUsers: [
        {
          id: mockUser.blockUsers[0]._id,
          userName: mockUser.blockUsers[0].blockedUserName,
          avatarImage: mockUser.blockUsers[0].blockedUserAvatar,
        },
      ],
    });
  });

  it('should return a 404 status code if user is not found', async () => {
    const userId = new mongoose.Types.ObjectId('000000000000000000000005');
    const req = { userId: userId.toString() };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    await userController.getAllBlockedUsers(req, res);
    expect(User.findById).toHaveBeenCalledWith(userId.toString());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});