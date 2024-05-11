const SubReddit = require("../../models/subReddit");
const UserUpload = require("../../controllers/userUploadsController");
const { uploadAvatarImage } = require('../../controllers/subredditController');

jest.mock("../../models/subReddit", () => ({
  findById: jest.fn(),
}));

jest.mock("../../controllers/userUploadsController", () => ({
  uploadMedia: jest.fn(),
}));

describe('uploadAvatarImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upload avatar image successfully', async () => {
    const subredditId = 'subreddit123';
    const userId = 'user123';
    const subreddit = {
      moderators: [userId],
      appearance: {},
      save: jest.fn(),
    };
    const avatarImage = { filename: 'avatar.jpg' };
    const uploadedImageId = 'image123';
    SubReddit.findById.mockResolvedValueOnce(subreddit);
    UserUpload.uploadMedia.mockResolvedValueOnce(uploadedImageId);

    const req = { userId, body: { subredditId }, files: [avatarImage] };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await uploadAvatarImage(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(UserUpload.uploadMedia).toHaveBeenCalledWith(avatarImage);
    expect(subreddit.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: "Avatar image uploaded successfully" });
  });

  it('should handle error if subreddit is not found', async () => {
    const subredditId = 'subreddit123';
    const userId = 'user123';
    SubReddit.findById.mockResolvedValueOnce(null);

    const req = { userId, body: { subredditId }, files: [] };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await uploadAvatarImage(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'subreddit not found' });
  });

  it('should handle error if user is not a moderator', async () => {
    const subredditId = 'subreddit123';
    const userId = 'user123';
    const subreddit = {
      moderators: ['user456'],
    };
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { userId, body: { subredditId }, files: [] };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await uploadAvatarImage(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not a moderator' });
  });

  it('should handle error if no file provided for avatar image', async () => {
    const subredditId = 'subreddit123';
    const userId = 'user123';
    const subreddit = {
      moderators: [userId],
    };
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { userId, body: { subredditId }, files: [] };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await uploadAvatarImage(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'No file provided for avatar image' });
  });

  it('should handle error if failed to upload avatar image', async () => {
    const subredditId = 'subreddit123';
    const userId = 'user123';
    const subreddit = {
      moderators: [userId],
      appearance: {},
    };
    const avatarImage = { filename: 'avatar.jpg' };
    SubReddit.findById.mockResolvedValueOnce(subreddit);
    UserUpload.uploadMedia.mockResolvedValueOnce(null);

    const req = { userId, body: { subredditId }, files: [avatarImage] };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await uploadAvatarImage(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(UserUpload.uploadMedia).toHaveBeenCalledWith(avatarImage);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to upload avatar image' });
  });

  it('should handle server error', async () => {
    const subredditId = 'subreddit123';
    const userId = 'user123';
    const errorMessage = 'Some error message';
    SubReddit.findById.mockRejectedValueOnce(new Error(errorMessage));

    const req = { userId, body: { subredditId }, files: [] };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await uploadAvatarImage(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error uploading avatar image' });
  });
});