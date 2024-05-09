const { googleDisconnect } = require('../../controllers/authController');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');

jest.mock('../../models/User');
jest.mock('bcryptjs');

describe('googleDisconnect', () => {
  it('should disconnect a user from Google', async () => {
    const req = { 
      userId: 'testUserId', 
      body: { password: 'password123' } 
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const userMock = { 
      _id: 'testUserId', 
      password: 'hashedPassword', 
      signupGoogle: true, 
      save: jest.fn().mockResolvedValue({ _id: 'testUserId', signupGoogle: false }) 
    };

    User.findById.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(true);

    await googleDisconnect(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, userMock.password);
    expect(userMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Google disconnected successfully' });
  });


  

  it('should return a 400 status code if password is invalid', async () => {
    const req = { userId: 'testUserId', body: { password: 'password123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const userMock = { password: 'hashedPassword', signupGoogle: true };
    User.findById.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(false);

    await googleDisconnect(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, userMock.password);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid password' });
  });

  it('should return a 404 status code if user does not exist', async () => {
    const req = { userId: 'testUserId', body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
    User.findById.mockResolvedValue(null);
  
    await googleDisconnect(req, res);
  
    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });
  
  it('should return a 400 status code if user is not connected to Google', async () => {
    const req = { userId: 'testUserId', body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
    const userMock = { signupGoogle: false };
    User.findById.mockResolvedValue(userMock);
  
    await googleDisconnect(req, res);
  
    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User didn't signup using google signup" });
  });
  
  it('should return a 500 status code if an error occurs', async () => {
    const req = { userId: 'testUserId', body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
    User.findById.mockRejectedValue(new Error('Database error'));
  
    await googleDisconnect(req, res);
  
    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error disconnecting google', error: 'Database error' });
  });
});