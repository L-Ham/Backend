const { changePassword } = require('../../controllers/authController');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');

jest.mock('../../models/User');
jest.mock('bcryptjs');

describe('changePassword', () => {
  it('should return 404 if user not found', async () => {
    const req = { userId: 'invalidUserId', body: { oldPassword: 'password123', newPassword: 'password1234', confirmPassword: 'password1234' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findById.mockResolvedValue(null);

    await changePassword(req, res);

    expect(User.findById).toHaveBeenCalledWith('invalidUserId');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 400 if old password is invalid', async () => {
    const req = { userId: 'validUserId', body: { oldPassword: 'invalidPassword', newPassword: 'password1234', confirmPassword: 'password1234' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findById.mockResolvedValue({ password: 'password123' });
    bcrypt.compare.mockResolvedValue(false);

    await changePassword(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith('invalidPassword', 'password123');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid password' });
  });

  it('should return 400 if new password and confirm password do not match', async () => {
    const req = { userId: 'validUserId', body: { oldPassword: 'password123', newPassword: 'password1234', confirmPassword: 'password12345' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findById.mockResolvedValue({ password: 'password123' });
    bcrypt.compare.mockResolvedValue(true);

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Passwords do not match' });
  });

  it('should return 400 if new password is the same as old password', async () => {
    const req = { userId: 'validUserId', body: { oldPassword: 'password123', newPassword: 'password123', confirmPassword: 'password123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findById.mockResolvedValue({ password: 'password123' });
    bcrypt.compare.mockResolvedValue(true);

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'New password cannot be the same as old password' });
  });

  it('should return 400 if new password is less than 8 characters', async () => {
    const req = { userId: 'validUserId', body: { oldPassword: 'password123', newPassword: 'short', confirmPassword: 'short' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findById.mockResolvedValue({ password: 'password123' });
    bcrypt.compare.mockResolvedValue(true);

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password must be at least 8 characters' });
  });

  it('should change password successfully', async () => {
    const req = { userId: 'validUserId', body: { oldPassword: 'password123', newPassword: 'password1234', confirmPassword: 'password1234' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedPassword');
    const userMock = { password: 'password123', save: jest.fn().mockResolvedValue({}) };
    User.findById.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(true);

    await changePassword(req, res);

    expect(User.findById).toHaveBeenCalledWith('validUserId');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'password123');
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('password1234', 'salt');
    expect(userMock.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Password changed successfully' });
  });
});