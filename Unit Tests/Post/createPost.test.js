const { createPost } = require('../../controllers/postController');
const User = require('../../models/user');
const SubReddit = require('../../models/subReddit');
const UserUpload = require('../../controllers/userUploadsController');

jest.mock('../../models/user');
jest.mock('../../models/subReddit');
jest.mock('../../models/userUploads');

describe('createPost', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      userId: 'userId',
      body: {},
      files: [],
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a 404 status code if user is not found', async () => {
    User.findById.mockResolvedValue(null);

    await createPost(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return a 400 status code if title is not provided', async () => {
    User.findById.mockResolvedValue({});

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Title is required' });
  });

  it('should return a 400 status code for invalid post types', async () => {
    User.findById.mockResolvedValue({});
    req.body.title = 'Test Title';
    req.body.type = 'invalid';

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid post type' });
  });

it('should return a 400 status code if media file is required for image or video post', async () => {
    User.findById.mockResolvedValue({});
    req.body.title = 'Test Title';
    req.body.type = 'image';

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Media file is required for image or video post' });
});

it('should return a 400 status code if poll post does not include at least two options', async () => {
    User.findById.mockResolvedValue({});
    req.body.title = 'Test Title';
    req.body.type = 'poll';
    req.body['poll.options'] = ['Option 1'];

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Poll post must include a poll object with at least two options' });
});

it('should return a 400 status code if URL is required for link post', async () => {
    User.findById.mockResolvedValue({});
    req.body.title = 'Test Title';
    req.body.type = 'link';

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'URL is required for link post' });
});





});