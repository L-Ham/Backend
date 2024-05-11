const User = require("../../models/user");
const userController = require("../../controllers/userController");
User.findById = jest.fn();

describe('getNotificationSettings', () => {

    
    it('should return a 404 status code if user ID is not found', async () => {
      const req = { userId: 'invalidUserId' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      jest.spyOn(User, 'findById').mockResolvedValue(null);

      await userController.getNotificationSettings(req, res);

      expect(User.findById).toHaveBeenCalledWith('invalidUserId');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    // Return a JSON object with the notification settings
    it('should return a JSON object with the notification settings when the user is found', async () => {
      const userId = 'validUserId';
      const user = { notificationSettings: 'mockSettings' };
      const req = { userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findById = jest.fn().mockResolvedValue(user);

      await userController.getNotificationSettings(req, res);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ notificationSettings: 'mockSettings' });
    });

    // Return an error message if user ID is not found
    it('should return an error message if user ID is not found', async () => {
      const userId = 'invalidUserId';
      const req = { userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      jest.spyOn(console, 'error').mockImplementation(() => {});

      User.findById = jest.fn().mockResolvedValue(null);

      await userController.getNotificationSettings(req, res);

      expect(User.findById).toHaveBeenCalledWith(userId);
      //expect(console.log).toHaveBeenCalledWith("User not found for user ID:", userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    // Return a 500 status code if there is an error retrieving notification settings
    it('should return a 500 status code if there is an error retrieving notification settings', async () => {
      const userId = 'validUserId';
      const error = new Error('Error retrieving notification settings');
      const req = { userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findById = jest.fn().mockRejectedValue(error);

      await userController.getNotificationSettings(req, res);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error retrieving notification settings', error });
    });

    // Return an error message if there is an error retrieving notification settings
    it('should return an error message if there is an error retrieving notification settings', async () => {
      const userId = 'validUserId';
      const error = new Error('Error retrieving notification settings');
      const req = { userId };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findById = jest.fn().mockRejectedValue(error);

      await userController.getNotificationSettings(req, res);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error retrieving notification settings', error });
    });
});
