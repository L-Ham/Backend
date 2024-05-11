const User = require("../../models/user");
const userController = require("../../controllers/userController");
const NotificationServices = require("../../services/notification");
const mongoose = require('mongoose');


jest.mock("../../models/user", () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock("../../services/notification", () => ({
  sendNotification: jest.fn(),
}));

describe('followUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  
  
  it('should follow a user successfully without sending notification', async () => {
    const userId = 'user123';
    const usernameToFollow = 'user456';
    const user = {
      _id: userId,
      following: [],
      blockUsers: [],
      save: jest.fn(),
    };
    const userToFollow = {
      _id: new mongoose.Types.ObjectId(),
      followers: [],
      blockUsers: [],
      userName: usernameToFollow,
      notificationSettings: new Map([['newFollowers', false]]),
      save: jest.fn(),
    };
    User.findById.mockResolvedValueOnce(user);
    User.findOne.mockResolvedValueOnce(userToFollow);
  
    const req = { userId, body: { usernameToFollow } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await userController.followUser(req, res);
  
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(User.findOne).toHaveBeenCalledWith({ userName: usernameToFollow });
    expect(user.following).toContain(userToFollow._id);
    expect(userToFollow.followers).toContain(userId);
    expect(user.save).toHaveBeenCalled();
    expect(userToFollow.save).toHaveBeenCalled();
    expect(NotificationServices.sendNotification).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: 'User followed successfully & Notification Not Required',
    });
  });
  
  it('should return 404 if user not found', async () => {
    const userId = 'user123';
    const usernameToFollow = 'user456';
    User.findById.mockResolvedValueOnce(null);
  
    const req = { userId, body: { usernameToFollow } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await userController.followUser(req, res);
  
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(User.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });
  
  it('should return 404 if user to follow not found', async () => {
    const userId = 'user123';
    const usernameToFollow = 'user456';
    const user = {
      _id: userId,
      following: [],
      blockUsers: [],
    };
    User.findById.mockResolvedValueOnce(user);
    User.findOne.mockResolvedValueOnce(null);
  
    const req = { userId, body: { usernameToFollow } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await userController.followUser(req, res);
  
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(User.findOne).toHaveBeenCalledWith({ userName: usernameToFollow });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User to follow not found' });
  });
  
  
  

});