const jwt = require('jsonwebtoken');
const authenticateToken = require('../../middleware/authenticateToken');

jest.mock('jsonwebtoken');

describe('authenticateToken', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should handle no token provided', () => {
    authenticateToken(req, res, next);
    expect(req.userId).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  it('should handle invalid token', () => {
    req.headers.authorization = 'Bearer invalid_token';
    jwt.verify.mockImplementationOnce((token, secret, callback) => callback(true));
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Invalid token' });
  });

  it('should handle valid token', () => {
    req.headers.authorization = 'Bearer valid_token';
    const decoded = { user: { id: 'user_id' } };
    jwt.verify.mockImplementationOnce((token, secret, callback) => callback(null, decoded));
    authenticateToken(req, res, next);
    expect(req.userId).toBe(decoded.user.id);
    expect(next).toHaveBeenCalled();
  });
});