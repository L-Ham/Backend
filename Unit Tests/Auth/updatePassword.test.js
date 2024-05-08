const { updatePassword } = require('../../controllers/authController');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('updatePassword', () => {
  it('should return 401 if no token provided', async () => {
    const req = { headers: {}, body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updatePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: No token provided' });
  });

  it('should return 403 if token is invalid', async () => {
    const req = { headers: { authorization: 'Bearer invalidToken' }, body: {password:''} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    jwt.verify.mockImplementation((token, secret, callback) => callback(true));

    await updatePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Invalid token' });
  });

  it('should return 400 if passwords do not match', async () => {
    const req = { headers: { authorization: 'Bearer validToken' }, body: { password: 'password123', passwordConfirm: 'password124' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    jwt.verify.mockImplementation((token, secret, callback) => callback(null, { user: { email: 'test@test.com' } }));

    await updatePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Passwords do not match' });
  });

  it('should return 400 if password is less than 8 characters', async () => {
    const req = { headers: { authorization: 'Bearer validToken' }, body: { password: 'short', passwordConfirm: 'short' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    jwt.verify.mockImplementation((token, secret, callback) => callback(null, { user: { email: 'test@test.com' } }));

    await updatePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password must be at least 8 characters' });
  });

  it('should return 400 if password is empty', async () => {
    const req = { headers: { authorization: 'Bearer validToken' }, body: { password: '', passwordConfirm: '' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    jwt.verify.mockImplementation((token, secret, callback) => callback(null, { user: { email: 'test@test.com' } }));

    await updatePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password must be at least 8 characters' });
  });

  it('should return 404 if user not found', async () => {
    const req = { headers: { authorization: 'Bearer validToken' }, body: { password: 'password123', passwordConfirm: 'password123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    jwt.verify.mockImplementation((token, secret, callback) => callback(null, { user: { email: 'test@test.com' } }));
    User.findOne.mockResolvedValue(null);

    await updatePassword(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should update password successfully', async () => {
    const req = { headers: { authorization: 'Bearer validToken' }, body: { password: 'password123', passwordConfirm: 'password123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    jwt.verify.mockImplementation((token, secret, callback) => callback(null, { user: { email: 'test@test.com' } }));
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    const userMock = { email: 'test@test.com', password: 'oldPassword', save: jest.fn().mockResolvedValue({}) };
    User.findOne.mockResolvedValue(userMock);

    await updatePassword(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
    expect(userMock.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Password updated successfully' });
  });
});