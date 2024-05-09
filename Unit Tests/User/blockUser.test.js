const User = require("../../models/user");
const userController = require("../../controllers/userController");

describe('blockUser', () => {
    it('should block a user and return the updated user', async () => {
    const userToBlock = { _id: 'userToBlockId', userName: 'userToBlock' };
    const user = { _id: 'userId', blockUsers: [], followers: [], save: jest.fn() };
      const blockedUserName = 'userToBlock';
      const userId = 'validUserId';
      const req = {
        body: { usernameToBlock: blockedUserName },
        userId
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findOne = jest.fn().mockResolvedValue(userToBlock);
      User.findById = jest.fn().mockResolvedValueOnce(user).mockResolvedValueOnce(userToBlock);
  
      await userController.blockUser(req, res);
    });
  
    it('should return a 404 status code if user to block is not found', async () => {
      const blockedUserName = 'userToBlock';
      const userId = 'validUserId';
      const req = {
        body: { usernameToBlock: blockedUserName },
        userId
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findOne = jest.fn().mockResolvedValue(null);
  
      await userController.blockUser(req, res);
    });
  
    it('should return a 400 status code if user tries to block themselves', async () => {
      const blockedUserName = 'userToBlock';
      const userId = 'validUserId';
      const req = {
        body: { usernameToBlock: blockedUserName },
        userId
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      const userToBlock = {
        _id: userId,
        userName: blockedUserName
      };
      User.findOne = jest.fn().mockResolvedValue(userToBlock);
  
      await userController.blockUser(req, res);
    });
  
    it('should return a 409 status code if user is already blocked', async () => {
      const userToBlock = { _id: 'userToBlockId', userName: 'userToBlock' };
      const user = { _id: 'userId', blockUsers: [{ blockedUserId: 'userToBlockId' }], followers: [], save: jest.fn() };
      const blockedUserName = 'userToBlock';
      const userId = 'validUserId';
      const req = {
        body: { usernameToBlock: blockedUserName },
        userId
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findOne = jest.fn().mockResolvedValue(userToBlock);
      User.findById = jest.fn().mockResolvedValueOnce(user).mockResolvedValueOnce(userToBlock);
  
      await userController.blockUser(req, res);
    });
  
    it('should return a 500 status code if an error occurs', async () => {
      const blockedUserName = 'userToBlock';
      const userId = 'validUserId';
      const req = {
        body: { usernameToBlock: blockedUserName },
        userId
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));
  
      await userController.blockUser(req, res);
    });
  });