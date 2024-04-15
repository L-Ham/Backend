const bcrypt = require('bcrypt');
const User = require('../../models/user');
const authController = require('../../controllers/authController');

describe('deleteAccount', () => {
  it('should delete the account if user credentials are valid', async () => {
    const userId = 'validUserId';
    const req = {
      userId,
      body: {
        leavingReason: 'Some reason',
        userName: 'validUserName',
        password: 'validPassword'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      _id: userId,
      userName: 'validUserName',
      password: await bcrypt.hash('validPassword', 10)
    };

    User.findById = jest.fn().mockResolvedValue(user);
    User.findByIdAndDelete = jest.fn().mockResolvedValue();

    await authController.deleteAccount(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Account deleted successfully' });
  });

  it('should return a 404 status code if user is not found', async () => {
    const userId = 'invalidUserId';
    const req = {
      userId,
      body: {
        leavingReason: 'Some reason',
        userName: 'validUserName',
        password: 'validPassword'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockResolvedValue(null);

    await authController.deleteAccount(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return a 400 status code if invalid username is provided', async () => {
    const userId = 'validUserId';
    const req = {
      userId,
      body: {
        leavingReason: 'Some reason',
        userName: 'invalidUserName',
        password: 'validPassword'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      _id: userId,
      userName: 'validUserName',
      password: await bcrypt.hash('validPassword', 10)
    };

    User.findById = jest.fn().mockResolvedValue(user);

    await authController.deleteAccount(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid username' });
  });

  it('should return a 400 status code if invalid password is provided', async () => {
    const userId = 'validUserId';
    const req = {
      userId,
      body: {
        leavingReason: 'Some reason',
        userName: 'validUserName',
        password: 'invalidPassword'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      _id: userId,
      userName: 'validUserName',
      password: await bcrypt.hash('validPassword', 10)
    };

    User.findById = jest.fn().mockResolvedValue(user);
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    await authController.deleteAccount(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
  
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid password' });
  });

  it('should return a 500 status code if an error occurs', async () => {
    const userId = 'validUserId';
    const req = {
      userId,
      body: {
        leavingReason: 'Some reason',
        userName: 'validUserName',
        password: 'validPassword'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

    await authController.deleteAccount(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting account', error: 'Database error' });
  });
});