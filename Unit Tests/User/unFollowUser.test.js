const User = require('../../models/user');
const userController = require("../../controllers/userController");

jest.mock('../../models/user');

describe('unfollowUser', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      userId: 'user123',
      body: {
        usernameToUnfollow: 'testuser2',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 500 if user to unfollow is not found', async () => {
    User.findOne.mockResolvedValueOnce(null);

    await userController.unfollowUser(req, res);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser2' });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'User to unfollow not found' });
  });

  it('should return 500 if user is not followed', async () => {
    const user = {
      following: [],
    };
    const userToUnfollow = {
      _id: 'user456',
    };
    User.findById.mockResolvedValueOnce(user);
    User.findOne.mockResolvedValueOnce(userToUnfollow);

    await userController.unfollowUser(req, res);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser2' });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not followed' });
  });

//   it('should unfollow user successfully', async () => {
//     const user = {
//       _id: 'user123',
//       following: ['user456'],
//     };
//     const userToUnfollow = {
//       _id: 'user456',
//       followers: ['user123'],
//     };
//     User.findById.mockResolvedValueOnce(user);
//     User.findOne.mockResolvedValueOnce(userToUnfollow);

//     await userController.unfollowUser(req, res);

//     expect(User.findById).toHaveBeenCalledWith('user123');
//     expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser2' });
//     expect(user.following).not.toContain('user456');
//     expect(userToUnfollow.followers).not.toContain('user123');
//     expect(user.save).toHaveBeenCalled();
//     expect(userToUnfollow.save).toHaveBeenCalled();
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({ message: 'User unfollowed successfully' });
//   });

  it('should handle server error', async () => {
    User.findById.mockRejectedValueOnce(new Error('Some error message'));

    await userController.unfollowUser(req, res);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(User.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to unfollow user',
      error: 'Some error message',
    });
  });
});