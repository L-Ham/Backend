const { uploadAvatarImage } = require('../../controllers/userController');
const User = require('../../models/user');
const UserUpload = require('../../controllers/userUploadsController');

jest.mock('../../models/user');
jest.mock('../../controllers/userUploadsController');

describe('uploadAvatarImage', () => {
  it('should upload an avatar image', async () => {
    const req = { userId: 'validUserId', files: [{ name: 'image.jpg' }] };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    const userMock = { 
      _id: 'validUserId', 
      avatarImage: null, 
      save: jest.fn() 
    };

    User.findById.mockResolvedValue(userMock);
    UserUpload.uploadMedia.mockResolvedValue('imageId');

    await uploadAvatarImage(req, res, next);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(UserUpload.uploadMedia).toHaveBeenCalledWith(req.files[0]);
    expect(userMock.avatarImage).toBe('imageId');
    expect(userMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Avatar image uploaded successfully', user: userMock });
  });

  it('should return a 404 status code if user is not found', async () => {
    const req = { userId: 'invalidUserId' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    User.findById.mockResolvedValue(null);

    await uploadAvatarImage(req, res, next);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return a 400 status code if no file is provided', async () => {
    const req = { userId: 'validUserId', files: [] };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    User.findById.mockResolvedValue({});

    await uploadAvatarImage(req, res, next);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'No file provided for avatar image' });
  });

  it('should return a 400 status code if upload fails', async () => {
    const req = { userId: 'validUserId', files: [{ name: 'image.jpg' }] };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    User.findById.mockResolvedValue({});
    UserUpload.uploadMedia.mockResolvedValue(null);

    await uploadAvatarImage(req, res, next);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(UserUpload.uploadMedia).toHaveBeenCalledWith(req.files[0]);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to upload avatar image' });
  });

  it('should return a 500 status code if an error occurs', async () => {
    const req = { userId: 'validUserId', files: [{ name: 'image.jpg' }] };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    User.findById.mockRejectedValue(new Error('Database error'));

    await uploadAvatarImage(req, res, next);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error uploading avatar image' });
  });
});