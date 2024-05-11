const User = require("../../models/user");
const userController = require("../../controllers/userController");

jest.mock("../../models/user", () => ({
  findOne: jest.fn(),
}));

describe('checkUserNameAvailability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return "Username available" if the username is not taken', async () => {
    const req = { query: { username: 'newUser' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne.mockResolvedValueOnce(null);

    await userController.checkUserNameAvailability(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: 'newUser' });
    expect(res.json).toHaveBeenCalledWith({ message: 'Username available' });
  });

  it('should return "Username already taken" if the username is already taken', async () => {
    const req = { query: { username: 'existingUser' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne.mockResolvedValueOnce({ userName: 'existingUser' });

    await userController.checkUserNameAvailability(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: 'existingUser' });
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'Username already taken' });
  });

  it('should return "Username is empty" if the username is empty', async () => {
    const req = { query: { username: '' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.checkUserNameAvailability(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Username is empty' });
  });

  it('should handle server error', async () => {
    const req = { query: { username: 'newUser' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = 'Some error message';
    User.findOne.mockRejectedValueOnce(new Error(errorMessage));

    await userController.checkUserNameAvailability(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: 'newUser' });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
  });
});