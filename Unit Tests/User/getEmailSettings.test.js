const User = require("../../models/user");
const userController = require("../../controllers/userController");

// Mocking User.findById function
jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

describe('getEmailSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user email settings', async () => {
    const userId = 'user123';
    const user = {
      emailSettings: {
        receiveNotifications: true,
        receiveNewsletter: false,
        receivePromotions: true,
      },
    };
    User.findById.mockResolvedValueOnce(user);

    const req = { userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.getEmailSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.json).toHaveBeenCalledWith({
      emailSettings: {
        receiveNotifications: true,
        receiveNewsletter: false,
        receivePromotions: true,
      },
    });
  });

  it('should handle error if user is not found', async () => {
    const userId = 'user123';
    User.findById.mockResolvedValueOnce(null);

    const req = { userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.getEmailSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
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

    await userController.getEmailSettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    //expect(res.json).toHaveBeenCalledWith({ message: 'Error retrieving email settings', error: errorMessage });
  });
});