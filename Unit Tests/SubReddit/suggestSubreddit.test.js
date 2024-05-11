const { suggestSubreddit } = require('../../controllers/subredditController');
const User = require('../../models/user');
const SubReddit = require('../../models/subReddit');
const UserUploadModel = require('../../models/userUploads');

jest.mock('../../models/user');
jest.mock('../../models/subReddit');
jest.mock('../../models/userUploads');

describe('suggestSubreddit', () => {
  const req = { userId: '123' };
  const res = {
    status: jest.fn(function() {
      return this;
    }),
    json: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if user is not found', async () => {
    User.findById.mockResolvedValue(null);

    await suggestSubreddit(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 404 if no subreddits found', async () => {
    User.findById.mockResolvedValue({ communities: ['1', '2'] });
    SubReddit.find.mockResolvedValue([]);

    await suggestSubreddit(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'No subreddits Found' });
  });

  it('should return 200 with suggested subreddit if subreddits found', async () => {
    User.findById.mockResolvedValue({ communities: ['1', '2'] });
    SubReddit.find.mockResolvedValue([{ appearance: { avatarImage: '3', bannerImage: '4' }, name: 'test' }]);
    UserUploadModel.findById.mockResolvedValue({ url: 'testUrl' });

    await suggestSubreddit(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Suggesting a Subreddit', suggestedSubreddit: { name: 'test', avatarImage: 'testUrl', bannerImage: 'testUrl' } });
  });

  it('should return 500 if error occurs', async () => {
    User.findById.mockRejectedValue(new Error('Test error'));

    await suggestSubreddit(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error Suggesting a Subreddit', error: 'Test error' });
  });
});