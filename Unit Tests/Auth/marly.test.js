const { getWidget } = require('../../controllers/subredditController');
const User = require('../../models/user');
const SubReddit = require('../../models/subReddit');
const UserUploadModel = require('../../models/userUploads');

jest.mock('../../models/user');
jest.mock('../../models/subReddit');
jest.mock('../../models/userUploads');

describe('getWidget', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      userId: 'testUserId',
      query: {
        subredditId: 'testSubredditId',
      },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });
  it('should return subreddit widgets if user and subreddit exist', async () => {
    const mockUser = { _id: 'testUserId' };
    const mockSubreddit = {
      _id: 'testSubredditId',
      moderators: [],
      appearance: {},
      members: [],
      textWidgets: [],
      rules: [],
      orderWidget: [],
      createdAt: new Date(), // Add this line
    };
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    UserUploadModel.findById.mockResolvedValue(null);
  
    await getWidget(req, res, next);
  
    expect(res.json).toHaveBeenCalledWith({
      message: "Subreddit widgets retrieved successfully",
      communityDetails: expect.any(Object),
      textWidgets: expect.any(Object),
      moderators: expect.any(Array),
      rules: expect.any(Array),
      orderWidget: expect.any(Array),
    });
  });

  it('should handle error if user is not found', async () => {
    User.findById.mockResolvedValue(null);

    await getWidget(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it('should handle error if subreddit is not found', async () => {
    const mockUser = { _id: 'testUserId' };
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(null);

    await getWidget(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it('should handle server error', async () => {
    User.findById.mockRejectedValue(new Error());

    await getWidget(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error getting subreddit widgets" });
  });
});