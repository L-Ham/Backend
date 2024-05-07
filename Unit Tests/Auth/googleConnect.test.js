const { googleConnect } = require('../../controllers/authController');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');

jest.mock('../../models/User');
jest.mock('bcryptjs');

describe('googleConnect', () => {
  it('should connect a user to Google', async () => {
    const req = { 
      userId: 'testUserId', 
      body: { password: 'password123' }, 
      decoded: { email: 'test@test.com' } 
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const userMock = { 
      _id: 'testUserId', 
      email: 'test@test.com', 
      password: 'hashedPassword', 
      signupGoogle: false, 
      save: jest.fn().mockResolvedValue({ _id: 'testUserId', email: 'test@test.com', signupGoogle: true }) 
    };

    User.findById.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(true);

    await googleConnect(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, userMock.password);
    expect(userMock.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Google connected successfully', user: userMock });
  });

  it('should return a 404 status code if user does not exist', async () => {
    const req = { userId: 'testUserId' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findById.mockResolvedValue(null);

    await googleConnect(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return a 400 status code if user is already connected to Google', async () => {
    const req = { userId: 'testUserId' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const userMock = { signupGoogle: true };
    User.findById.mockResolvedValue(userMock);

    await googleConnect(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already connected to google' });
  });

  it('should return a 400 status code if password is invalid', async () => {
    const req = { userId: 'testUserId', body: { password: 'password123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const userMock = { password: 'hashedPassword', signupGoogle: false };
    User.findById.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(false);

    await googleConnect(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, userMock.password);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid password' });
  });

  it('should return a 500 status code if an error occurs', async () => {
    const req = { userId: 'testUserId' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findById.mockRejectedValue(new Error('Database error'));

    await googleConnect(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error Connecting google', error: 'Database error' });
  });
});