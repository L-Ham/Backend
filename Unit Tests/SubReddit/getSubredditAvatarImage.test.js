const SubReddit = require("../../models/subReddit");
const UserUploadModel = require("../../models/userUploads");
const { getAvatarImage } = require('../../controllers/subredditController');

jest.mock("../../models/subReddit", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/userUploads", () => ({
  findById: jest.fn(),
}));

describe('getAvatarImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get avatar image successfully', async () => {
    const subredditId = 'subreddit123';
    const avatarImageId = 'image123';
    const avatarImage = {
      _id: avatarImageId,
      url: 'http://example.com/avatar.jpg',
      originalname: 'avatar.jpg',
    };
    const subreddit = {
      appearance: {
        avatarImage: avatarImageId,
      },
    };
    SubReddit.findById.mockResolvedValueOnce(subreddit);
    UserUploadModel.findById.mockResolvedValueOnce(avatarImage);

    const req = { query: { subredditId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await getAvatarImage(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(UserUploadModel.findById).toHaveBeenCalledWith(avatarImageId);
    expect(res.send).toHaveBeenCalledWith(avatarImage);
  });

  it('should handle error if subreddit is not found', async () => {
    const subredditId = 'subreddit123';
    SubReddit.findById.mockResolvedValueOnce(null);

    const req = { query: { subredditId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getAvatarImage(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Subreddit not found' });
  });

  it('should handle error if avatar image is not found in subreddit', async () => {
    const subredditId = 'subreddit123';
    const subreddit = {
      appearance: {},
    };
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { query: { subredditId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getAvatarImage(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Avatar image not found' });
  });

  it('should handle error if avatar image is not found in uploads', async () => {
    const subredditId = 'subreddit123';
    const avatarImageId = 'image123';
    const subreddit = {
      appearance: {
        avatarImage: avatarImageId,
      },
    };
    SubReddit.findById.mockResolvedValueOnce(subreddit);
    UserUploadModel.findById.mockResolvedValueOnce(null);

    const req = { query: { subredditId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getAvatarImage(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(subredditId);
    expect(UserUploadModel.findById).toHaveBeenCalledWith(avatarImageId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Avatar image not found' });
  });
});