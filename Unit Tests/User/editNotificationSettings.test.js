const User = require("../../models/user");
const userController = require("../../controllers/userController");

User.findById = jest.fn();

// Mocking User.findById and user.save functions
jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

describe('editNotificationSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update user notification settings', async () => {
    const userId = 'user123';
    const req = {
      userId,
      body: {
        inboxMessage: true,
        chatMessages: false,
        chatRequest: true,
        mentions: false,
        comments: true,
        upvotesToPosts: false,
        upvotesToComments: true,
        repliesToComments: false,
        newFollowers: true,
        modNotifications: false,
      },
    };
    const user = {
      notificationSettings: new Map(),
      save: jest.fn(),
    };
    User.findById.mockResolvedValueOnce(user);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.editNotificationSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(user.notificationSettings.get("inboxMessage")).toBe(true);
    expect(user.notificationSettings.get("chatMessages")).toBe(false);
    expect(user.notificationSettings.get("chatRequest")).toBe(true);
    expect(user.notificationSettings.get("mentions")).toBe(false);
    expect(user.notificationSettings.get("comments")).toBe(true);
    expect(user.notificationSettings.get("upvotesToPosts")).toBe(false);
    expect(user.notificationSettings.get("upvotesToComments")).toBe(true);
    expect(user.notificationSettings.get("repliesToComments")).toBe(false);
    expect(user.notificationSettings.get("newFollowers")).toBe(true);
    expect(user.notificationSettings.get("modNotifications")).toBe(false);
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User Notification settings updated successfully",
      user,
    });
  });

  it('should handle error if user is not found', async () => {
    const userId = 'user123';
    const req = {
      userId,
      body: {
        inboxMessage: true,
        chatMessages: false,
        chatRequest: true,
        mentions: false,
        comments: true,
        upvotesToPosts: false,
        upvotesToComments: true,
        repliesToComments: false,
        newFollowers: true,
        modNotifications: false,
      },
    };
    User.findById.mockResolvedValueOnce(null);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.editNotificationSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should handle server error', async () => {
    const userId = 'user123';
    const req = {
      userId,
      body: {
        inboxMessage: true,
        chatMessages: false,
        chatRequest: true,
        mentions: false,
        comments: true,
        upvotesToPosts: false,
        upvotesToComments: true,
        repliesToComments: false,
        newFollowers: true,
        modNotifications: false,
      },
    };
    const errorMessage = 'Some error message';
    User.findById.mockRejectedValueOnce(new Error(errorMessage));

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.editNotificationSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error updating notification settings' });
  });
});