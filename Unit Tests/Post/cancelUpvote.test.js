// cancelUpvote.test.js
const { cancelUpvote } = require('../../controllers/postController');
const Post = require("../../models/post");
const User = require("../../models/user");
const mongoose = require('mongoose'); 
describe('cancelUpvote', () => {
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

  it('should cancel the upvote if post is upvoted by the user', async () => {
    postId= new mongoose.Types.ObjectId(1);
    userId= new mongoose.Types.ObjectId(2);
    const post = {
      _id: postId,
      upvotes: 1,
      upvotedUsers: [userId],
      save: jest.fn()
    };
    const user = {
      _id: userId,
      upvotedPosts: [postId],
      save: jest.fn()
    };
    req2 = {
      userId: userId,
      body: {
        postId: postId
      }
    };

    Post.findById = jest.fn().mockResolvedValue(post);
    User.findById = jest.fn().mockResolvedValue(user);

    await cancelUpvote(req2, res, next);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(post.upvotes).toBe(0);
    
  });

  it('should return 404 if post is not found', async () => {
    Post.findById = jest.fn().mockResolvedValue(null);

    await cancelUpvote(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
  });

  it('should return 400 if post is not upvoted by the user', async () => {
    const post = {
      _id: 'post123',
      upvotes: 1,
      upvotedUsers: [],
      save: jest.fn()
    };

    Post.findById = jest.fn().mockResolvedValue(post);

    await cancelUpvote(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post not upvoted' });
  });



  it('should return 500 if an error occurs while cancelling upvote', async () => {
    const error = new Error('Internal Server Error');

    Post.findById = jest.fn().mockRejectedValue(error);

    await cancelUpvote(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error cancelling upvote', error: error });
  });
});