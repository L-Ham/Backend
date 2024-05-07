const { signUp } = require('../../controllers/authController');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('express-validator');

describe('signUp', () => {
  it('should register a new user', async () => {
    const req = { 
      body: { 
        userName: 'testUser', 
        email: 'test@test.com', 
        password: 'password123', 
        gender: 'male' 
      } 
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockResolvedValue(null);
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    jwt.sign.mockImplementation((payload, secret, options, callback) => callback(null, 'token'));

    const userMock = { 
      _id: 'userId', 
      userName: 'testUser', 
      email: 'test@test.com', 
      password: 'hashedPassword', 
      gender: 'male', 
      signupGoogle: false, 
      save: jest.fn().mockResolvedValue({ _id: 'userId', userName: 'testUser', email: 'test@test.com' }) 
    };

    User.mockReturnValue(userMock);

    await signUp(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 'salt');
    expect(userMock.save).toHaveBeenCalled();
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ token: 'token', message: 'User registered successfully' });
  });

  it('should return a 400 status code if validation errors exist', async () => {
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    validationResult.mockReturnValue({ isEmpty: () => false, array: () => ['error'] });

    await signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: ['error'] });
  });

  it('should return a 400 status code if user already exists', async () => {
    const req = { body: { email: 'test@test.com' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockResolvedValue({});

    await signUp(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
  });

  it('should return a 400 status code if password is less than 8 characters', async () => {
    const req = { body: { email: 'test@test.com', password: 'short' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockResolvedValue(null);

    await signUp(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password must be at least 8 characters' });
  });

  it('should return a 500 status code if an error occurs', async () => {
    const req = { body: { email: 'test@test.com', password: 'password123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockRejectedValue(new Error('Database error'));

    await signUp(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
  });
});