const User = require("../../models/user");
const userController = require("../../controllers/userController");

describe('unblockUser', () => {
    it('should unblock a user and return the updated user', async () => {
      const userToUnblock = { _id: 'userToUnblockId', userName: 'userToUnblock' };
      const user = { _id: 'userId', blockUsers: [{ blockedUserId: 'userToUnblockId' }], save: jest.fn() };
  
      const req = {
        body: { UserNameToUnblock: userToUnblock.userName },
        userId: user._id
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findOne = jest.fn().mockResolvedValue(userToUnblock);
      User.findById = jest.fn().mockResolvedValue(user);
  
      await userController.unblockUser(req, res);
    });
  
    it('should return a 404 status code if user to unblock is not found', async () => {
      const req = {
        body: { UserNameToUnblock: 'nonexistentUser' },
        userId: 'validUserId'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findOne = jest.fn().mockResolvedValue(null);
  
      await userController.unblockUser(req, res);
    });
  
    it('should return a 400 status code if user tries to unblock themselves', async () => {
      const req = {
        body: { UserNameToUnblock: 'userToUnblock' },
        userId: 'userToUnblockId'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      const userToUnblock = {
        _id: 'userToUnblockId',
        userName: 'userToUnblock'
      };
      User.findOne = jest.fn().mockResolvedValue(userToUnblock);
  
      await userController.unblockUser(req, res);
    });
  
    it('should return a 409 status code if user is not blocked', async () => {
      const userToUnblock = { _id: 'userToUnblockId', userName: 'userToUnblock' };
      const user = { _id: 'userId', blockUsers: [], save: jest.fn() };
  
      const req = {
        body: { UserNameToUnblock: userToUnblock.userName },
        userId: user._id
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findOne = jest.fn().mockResolvedValue(userToUnblock);
      User.findById = jest.fn().mockResolvedValue(user);
  
      await userController.unblockUser(req, res);
    });
  
    it('should return a 500 status code if an error occurs', async () => {
      const req = {
        body: { UserNameToUnblock: 'userToUnblock' },
        userId: 'validUserId'
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));
  
      await userController.unblockUser(req, res);
    });
  });