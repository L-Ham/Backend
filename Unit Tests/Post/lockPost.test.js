// postController.test.js
const { lockPost } = require('../../controllers/postController');
const Post = require("../../models/post");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const mongoose = require('mongoose');
jest.mock('../../models/Post');
jest.mock('../../models/User');
jest.mock('../../models/SubReddit');

describe('lockPost', () => {
  const mockPost = { 
    _id: 'testPostId', 
    user: 'testUserId',
    subReddit: 'testSubRedditId',
    isLocked: false,
    save: jest.fn() 
  };
  const mockUser = { 
    _id: 'testUserId', 
  };
  const mockSubreddit = { 
    _id: 'testSubredditId', 
    moderators: ['testUserId'], 
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if post does not exist', async () => {
    const req = { 
      userId: 'testUserId', 
      body: { 
        postId: 'nonexistentPostId', 
      } 
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    Post.findById.mockResolvedValue(null);
    await lockPost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
  });

  it('should return 404 if user does not exist', async () => {
    const req = { 
      userId: 'nonexistentUserId', 
      body: { 
        postId: 'testPostId', 
      } 
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    Post.findById.mockResolvedValue(mockPost);
    User.findById.mockResolvedValue(null);
    await lockPost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it('should return 404 if subreddit does not exist', async () => {
    const req = { 
      userId: 'testUserId', 
      body: { 
        postId: 'testPostId', 
      } 
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    Post.findById.mockResolvedValue(mockPost);
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(null);
    await lockPost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "SubReddit not found" });
  });

  it('should return 400 if user is not authorized to lock post', async () => {
    const req = { 
      userId: 'nonModeratorUserId', 
      body: { 
        postId: 'testPostId', 
      } 
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    Post.findById.mockResolvedValue(mockPost);
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    await lockPost(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User not authorized to lock post in the subreddit" });
  });

  it('should return 400 if post is already locked', async () => {
    const req = { 
      userId: 'testUserId', 
      body: { 
        postId: 'testPostId', 
      } 
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    Post.findById.mockResolvedValue({ ...mockPost, isLocked: true });
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    await lockPost(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Post is already locked" });
  });

  it('should return 200 if post is locked successfully', async () => {
    const req = { 
      userId: 'testUserId', 
      body: { 
        postId: 'testPostId', 
      } 
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    Post.findById.mockResolvedValue(mockPost);
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    await lockPost(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Post locked successfully" });
  });

  it('should return 500 if an error occurs', async () => {
    const req = { 
      userId: 'testUserId', 
      body: { 
        postId: 'testPostId', 
      } 
    };
    const res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    Post.findById.mockRejectedValue(new Error('Test error'));
    await lockPost(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error locking post", error: 'Test error' });
  });
});