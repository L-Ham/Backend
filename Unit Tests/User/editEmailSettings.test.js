const User = require("../../models/user");
const userController = require("../../controllers/userController");

// Mocking User.findById and User.prototype.save functions
jest.mock("../../models/user", () => ({
  findById: jest.fn(),
  prototype: {
    save: jest.fn(),
  },
}));

describe('editEmailSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update user email settings', async () => {
    const userId = 'user123';
    const req = {
      userId,
      body: {
        privateMessages: true,
        chatRequests: false,
        newUserWelcome: true,
        commentOnPost: false,
        repliesToComments: true,
        upvotesOnPosts: false,
        upvotesOnComments: true,
        usernameMentions: false,
        newFollowers: true,
        unsubscribeFromEmail: false,
      },
    };
    const user = {
      emailSettings: new Map(),
      save: jest.fn(),
    };
    User.findById.mockResolvedValueOnce(user);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.editEmailSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(user.emailSettings.get("privateMessages")).toBe(true);
    expect(user.emailSettings.get("chatRequests")).toBe(false);
    expect(user.emailSettings.get("newUserWelcome")).toBe(true);
    expect(user.emailSettings.get("commentOnPost")).toBe(false);
    expect(user.emailSettings.get("repliesToComments")).toBe(true);
    expect(user.emailSettings.get("upvotesOnPosts")).toBe(false);
    expect(user.emailSettings.get("upvotesOnComments")).toBe(true);
    expect(user.emailSettings.get("usernameMentions")).toBe(false);
    expect(user.emailSettings.get("newFollowers")).toBe(true);
    expect(user.emailSettings.get("unsubscribeFromEmail")).toBe(false);
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User Email settings updated successfully",
      user,
    });
  });

  it('should handle error if user is not found', async () => {
    const userId = 'user123';
    const req = {
      userId,
      body: {
        privateMessages: true,
        chatRequests: false,
        newUserWelcome: true,
        commentOnPost: false,
        repliesToComments: true,
        upvotesOnPosts: false,
        upvotesOnComments: true,
        usernameMentions: false,
        newFollowers: true,
        unsubscribeFromEmail: false,
      },
    };
    User.findById.mockResolvedValueOnce(null);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.editEmailSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should handle server error', async () => {
    const userId = 'user123';
    const req = {
      userId,
      body: {
        privateMessages: true,
        chatRequests: false,
        newUserWelcome: true,
        commentOnPost: false,
        repliesToComments: true,
        upvotesOnPosts: false,
        upvotesOnComments: true,
        usernameMentions: false,
        newFollowers: true,
        unsubscribeFromEmail: false,
      },
    };
    const errorMessage = 'Some error message';
    User.findById.mockRejectedValueOnce(new Error(errorMessage));

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.editEmailSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error updating email settings' });
  });
});