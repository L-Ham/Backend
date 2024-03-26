const User = require("../../models/user");
const authService = require("../../services/authServices");
const { generateUserName } = require("../../controllers/authController");
User.findById = jest.fn();

describe('generateUserName', () => {

    // The function should generate a random username.
    it('should generate a random username when called', () => {
      const mockUserNames = ['username1', 'username2', 'username3'];
      authService.generateRandomUsername = jest.fn().mockReturnValue(mockUserNames);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      generateUserName(req, res, next);

      expect(authService.generateRandomUsername).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usernames created Successfully",
        usernames: mockUserNames,
      });
    });

    // The authService dependency should throw an error.
    it('should handle error when authService throws an error', () => {
      authService.generateRandomUsername = jest.fn().mockImplementation(() => {
        throw new Error();
      });

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      generateUserName(req, res, next);

      expect(authService.generateRandomUsername).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Error Creating usernames" });
    });
});
