const User = require("../../models/user");
const userController = require("../../controllers/userController");

describe('editChatSettings', () => {
  it('should update the chat settings of the user', async () => {
    const userId = 'validUserId';
    const req = {
      userId,
      body: {
        chatRequests: 'Everyone',
        privateMessages: 'Nobody'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const chatSettings = {
        set: jest.fn(),
        notifications: true,
        theme: 'dark',
      };
      
      const user = {
        _id: 'userId',
        chatSettings,
        save: jest.fn().mockResolvedValue({ _id: 'userId', chatSettings }),
      };
      
      User.findById = jest.fn().mockResolvedValue(user);
      
    await userController.editChatSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    // expect(user.chatSettings.set).toHaveBeenCalledWith('chatRequests', 'Everyone');
    // expect(user.chatSettings.set).toHaveBeenCalledWith('privateMessages', 'Nobody');
    // expect(user.save).toHaveBeenCalled();
    // expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User Chat settings updated successfully',
      user
    });
  });

  it('should return a 404 status code if user is not found', async () => {
    const userId = 'invalidUserId';
    const req = {
      userId,
      body: {
        chatRequests: 'Everyone',
        privateMessages: 'Nobody'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockResolvedValue(null);

    await userController.editChatSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return a 400 status code if invalid chat request setting is provided', async () => {
    const userId = 'validUserId';
    const req = {
      userId,
      body: {
        chatRequests: 'InvalidSetting',
        privateMessages: 'Nobody'
      }
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

    await userController.editChatSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid chat request setting' });
  });

  it('should return a 400 status code if invalid private messages setting is provided', async () => {
    const userId = 'validUserId';
    const req = {
      userId,
      body: {
        chatRequests: 'Everyone',
        privateMessages: 'InvalidSetting'
      }
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

    await userController.editChatSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid private messages setting' });
  });

  it('should return a 500 status code if an error occurs', async () => {
    const userId = 'validUserId';
    const req = {
      userId,
      body: {
        chatRequests: 'Everyone',
        privateMessages: 'Nobody'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

    await userController.editChatSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error updating chat settings' });
  });
});