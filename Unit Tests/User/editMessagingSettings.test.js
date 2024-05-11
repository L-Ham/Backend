const User = require("../../models/user");
const userController = require("../../controllers/userController");

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));
describe('editChatSettings', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should handle same data sent as user chat settings', async () => {
      const userId = 'user123';
      const user = {
        chatSettings: {
          chatRequests: 'Nobody',
          privateMessages: 'Everyone',
        },
        save: jest.fn(),
      };
      User.findById.mockResolvedValueOnce(user);
  
      const req = { 
        userId, 
        body: {
          chatRequests: 'Nobody',
          privateMessages: 'Everyone',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await userController.editChatSettings(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(user.chatSettings.chatRequests).toBe('Nobody');
      expect(user.chatSettings.privateMessages).toBe('Everyone');
    
     
    });
  
    it('should handle error if user is not found', async () => {
      const userId = 'user123';
      User.findById.mockResolvedValueOnce(null);
  
      const req = { userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await userController.editChatSettings(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  
    it('should handle error if chat request setting is invalid', async () => {
      const userId = 'user123';
      const user = {
        chatSettings: {
          chatRequests: 'Everyone',
          privateMessages: 'Nobody',
        },
        save: jest.fn(),
      };
      User.findById.mockResolvedValueOnce(user);
  
      const req = { 
        userId, 
        body: {
          chatRequests: 'Invalid',
          privateMessages: 'Everyone',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await userController.editChatSettings(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid chat request setting' });
    });
  
    it('should handle error if private messages setting is invalid', async () => {
      const userId = 'user123';
      const user = {
        chatSettings: {
          chatRequests: 'Everyone',
          privateMessages: 'Nobody',
        },
        save: jest.fn(),
      };
      User.findById.mockResolvedValueOnce(user);
  
      const req = { 
        userId, 
        body: {
          chatRequests: 'Everyone',
          privateMessages: 'Invalid',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await userController.editChatSettings(req, res);
  
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid private messages setting' });
    });
  
    it('should handle server error', async () => {
      const userId = 'user123';
      const errorMessage = '[Error: Some error message]';
      User.findById.mockRejectedValueOnce(new Error(errorMessage));
     
      const req = { userId };
      const res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
     
      await userController.editChatSettings(req, res);
     
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating chat settings' });
     });
     
  });