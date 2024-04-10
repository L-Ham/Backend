const { markAsSpoiler } = require('../../controllers/postController');
const Post = require("../../models/post");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");

describe('markAsSpoiler', () => {
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

  it('should mark the post as spoiler if user is authorized', async () => {
    const post = {
      _id: 'post123',
      user: 'user123',
      subReddit: 'subreddit123',
      isSpoiler: false,
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

    await markAsSpoiler(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(SubReddit.findById).toHaveBeenCalledWith('subreddit123');
    expect(post.isSpoiler).toBe(true);
    expect(post.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post marked as spoiler' });
  });

  it('should return 404 if post is not found', async () => {
    Post.findById = jest.fn().mockResolvedValue(null);

    await markAsSpoiler(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
  });

  it('should return 400 if post is already marked as spoiler', async () => {
    const post = {
      _id: 'post123',
      isSpoiler: true
    };

    Post.findById = jest.fn().mockResolvedValue(post);

    await markAsSpoiler(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post is already marked as spoiler' });
  });

  it('should return 401 if user is not authorized to mark as spoiler', async () => {
    const post = {
        _id: 'post123',
        user: 'user456',
        subReddit: 'subreddit123',
        isSpoiler: false
    };
    const user = {
        _id: 'user123'
    };
    const postSubreddit = {
        _id: 'subreddit123',
        moderators: ['user789'],
        posts: ['post123']

    };

    Post.findById = jest.fn().mockResolvedValue(post);
    User.findById = jest.fn().mockResolvedValue(user);
    SubReddit.findById = jest.fn().mockResolvedValue(postSubreddit);

    await markAsSpoiler(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(post.isSpoiler).toBe(false);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not authorized to mark post as spoiler' });
});

it('should return 500 if an error occurs while marking as spoiler', async () => {
    const error = new Error('Internal Server Error');

    Post.findById = jest.fn().mockRejectedValue(error);

    await markAsSpoiler(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error Marking post as spoiler' });

});

});