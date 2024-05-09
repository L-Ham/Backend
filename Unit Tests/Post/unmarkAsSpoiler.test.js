const { unmarkAsSpoiler } = require('../../controllers/postController');
const Post = require("../../models/post");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");

describe('unmarkAsSpoiler', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      userId: 'user123',
      body: {
        postId: 'post123'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if post is not found', async () => {
    Post.findById = jest.fn().mockResolvedValueOnce(null);

    await unmarkAsSpoiler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
  });

  it('should return 400 if post is not marked as spoiler', async () => {
    const post = {
      isSpoiler: false
    };
    Post.findById = jest.fn().mockResolvedValueOnce(post);

    await unmarkAsSpoiler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post is not marked as spoiler' });
  });

  it('should return 404 if user is not found', async () => {
    const post = {
      isSpoiler: true,
      user: 'otherUser'
    };
    Post.findById = jest.fn().mockResolvedValueOnce(post);
    User.findById = jest.fn().mockResolvedValueOnce(null);

    await unmarkAsSpoiler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should unmark post as spoiler and return success message', async () => {
    const post = {
      isSpoiler: true,
      user: 'user123'
    };
    Post.findById = jest.fn().mockResolvedValueOnce(post);
    User.findById = jest.fn().mockResolvedValueOnce({ _id: 'user123' });
    SubReddit.findById = jest.fn().mockResolvedValueOnce(null);
    post.save = jest.fn().mockResolvedValueOnce(post);

    await unmarkAsSpoiler(req, res, next);

    expect(post.isSpoiler).toBe(false);
    expect(post.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post unmarked as spoiler' });
  });

  it('should return 500 if an error occurs', async () => {
    Post.findById = jest.fn().mockRejectedValueOnce(new Error('Database error'));

    await unmarkAsSpoiler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error Unmarking post as spoiler' });
  });
});