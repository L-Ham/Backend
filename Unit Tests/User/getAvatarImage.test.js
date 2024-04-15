const User = require('../../models/user');
const UserUploadModel = require('../../models/userUploads');
const { getAvatarImage } = require('../../controllers/userController');

describe('getAvatarImage', () => {
  it('should return the avatar image when user and avatar image exist', async () => {
    const req = {
      userId: 'userId',
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue({
      avatarImage: 'avatarImageId',
    });

    UserUploadModel.findById = jest.fn().mockResolvedValue({
      _id: 'avatarImageId',
      url: 'avatarImageUrl',
      originalname: 'avatarImageName',
    });

    await getAvatarImage(req, res);

    expect(User.findById).toHaveBeenCalledWith('userId');
    expect(UserUploadModel.findById).toHaveBeenCalledWith('avatarImageId');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      _id: 'avatarImageId',
      url: 'avatarImageUrl',
      originalname: 'avatarImageName',
    });
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return a 404 error when user is not found', async () => {
    const req = {
      userId: 'userId',
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue(null);

    await getAvatarImage(req, res);

    expect(User.findById).toHaveBeenCalledWith('userId');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    expect(res.send).not.toHaveBeenCalled();
  });

  it('should return a 404 error when avatar image is not found', async () => {
    const req = {
      userId: 'userId',
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue({
      avatarImage: 'avatarImageId',
    });

    UserUploadModel.findById = jest.fn().mockResolvedValue(null);

    await getAvatarImage(req, res);

    expect(User.findById).toHaveBeenCalledWith('userId');
    expect(UserUploadModel.findById).toHaveBeenCalledWith('avatarImageId');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Avatar image not found' });
    expect(res.send).not.toHaveBeenCalled();
  });

  it('should return a 500 error when there is an error getting the avatar image', async () => {
    const req = {
      userId: 'userId',
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

    await getAvatarImage(req, res);

    expect(User.findById).toHaveBeenCalledWith('userId');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error getting avatar image' });
    expect(res.send).not.toHaveBeenCalled();
  });
});