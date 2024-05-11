const User = require("../../models/user");
const userController = require("../../controllers/userController");

describe('getChatSettings', () => {
  it('should return the chat settings of the user', async () => {
    const userId = 'validUserId';
    const req = {
      userId
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      chatSettings: {
        theme: 'dark',
        notifications: true
      }
    };

    User.findById = jest.fn().mockResolvedValue(user);

    await userController.getChatSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(user.chatSettings);
  });

  it('should return a 404 status code if user is not found', async () => {
    const userId = 'invalidUserId';
    const req = {
      userId
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockResolvedValue(null);

    await userController.getChatSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return a 500 status code if an error occurs', async () => {
    const userId = 'validUserId';
    const req = {
      userId
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

    await userController.getChatSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error retrieving chat settings' });
  });
});