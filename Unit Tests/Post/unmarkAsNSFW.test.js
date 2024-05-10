// unmarkAsNSFW.test.js
const { unmarkAsNSFW } = require('../../controllers/postController');
const Post = require("../../models/post");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");

describe('unmarkAsNSFW', () => {
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
    Post.findById = jest.fn().mockResolvedValue(null);

    await unmarkAsNSFW(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
  });

  it('should return 400 if post is not marked as NSFW', async () => {
    const post = {
      _id: 'post123',
      isNSFW: false
    };

    Post.findById = jest.fn().mockResolvedValue(post);

    await unmarkAsNSFW(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post is not marked as NSFW' });
  });

  it('should return 404 if user is not found', async () => {
    const post = {
      _id: 'post123',
      isNSFW: true
    };

    Post.findById = jest.fn().mockResolvedValue(post);
    User.findById = jest.fn().mockResolvedValue(null);

    await unmarkAsNSFW(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 401 if user is not a moderator of the subreddit and not the post owner', async () => {
    const post = {
      _id: 'post123',
      user: 'user456',
      subReddit: 'subreddit123',
      isNSFW: true
    };
    const user = {
      _id: 'user123'
    };
    const postSubreddit = {
      moderators: ['user789']
    };

    Post.findById = jest.fn().mockResolvedValue(post);
    User.findById = jest.fn().mockResolvedValue(user);
    SubReddit.findById = jest.fn().mockResolvedValue(postSubreddit);

    await unmarkAsNSFW(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(SubReddit.findById).toHaveBeenCalledWith('subreddit123');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not authorized to unmark post as NSFW' });
  });

  it('should unmark the post as NSFW if user is a moderator of the subreddit', async () => {
    const post = {
      _id: 'post123',
      user: 'user456',
      subReddit: 'subreddit123',
      isNSFW: true,
      save: jest.fn()
    };
    const user = {
      _id: 'user123'
    };
    const postSubreddit = {
      moderators: ['user123']
    };

    Post.findById = jest.fn().mockResolvedValue(post);
    User.findById = jest.fn().mockResolvedValue(user);
    SubReddit.findById = jest.fn().mockResolvedValue(postSubreddit);

    await unmarkAsNSFW(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(SubReddit.findById).toHaveBeenCalledWith('subreddit123');
    expect(post.isNSFW).toBe(false);
    expect(post.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post unmarked as NSFW' });
  });

  it('should unmark the post as NSFW if user is the post owner', async () => {
    const post = {
      _id: 'post123',
      user: 'user123',
      subReddit: 'subreddit123',
      isNSFW: true,
      save: jest.fn()
    };
    const user = {
      _id: 'user123'
    };
    const postSubreddit = {
      moderators: ['user789']
    };

    Post.findById = jest.fn().mockResolvedValue(post);
    User.findById = jest.fn().mockResolvedValue(user);
    SubReddit.findById = jest.fn().mockResolvedValue(postSubreddit);

    await unmarkAsNSFW(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(SubReddit.findById).toHaveBeenCalledWith('subreddit123');
    expect(post.isNSFW).toBe(false);
    expect(post.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post unmarked as NSFW' });
  });

  it('should return 500 if an error occurs while unmarking as NSFW', async () => {
    const error = new Error('Internal Server Error');

    Post.findById = jest.fn().mockRejectedValue(error);

    await unmarkAsNSFW(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error Unmarking post as NSFW' });
  });
});