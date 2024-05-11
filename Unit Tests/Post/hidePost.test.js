const { hidePost } = require('../../controllers/postController');
const Post = require("../../models/post");
const User = require("../../models/user");
jest.mock('../../models/Post');
jest.mock('../../models/User');

describe('hidePost', () => {
  const mockPost = { 
    _id: 'testPostId', 
  };
  const mockUser = { 
    _id: 'testUserId', 
    hidePosts: [],
    save: jest.fn()
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if user does not exist', async () => {
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
    User.findById.mockResolvedValue(null);
    await hidePost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it('should return 404 if post does not exist', async () => {
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
    User.findById.mockResolvedValue(mockUser);
    Post.findById.mockResolvedValue(null);
    await hidePost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post Not Found" });
  });

  it('should return 500 if post is already hidden', async () => {
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
    User.findById.mockResolvedValue({
      ...mockUser,
      hidePosts: ['testPostId']
    });
    Post.findById.mockResolvedValue(mockPost);
    await hidePost(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "This post is already hidden in your profile" });
  });

  it('should return 200 if post is hidden successfully', async () => {
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
    User.findById.mockResolvedValue(mockUser);
    Post.findById.mockResolvedValue(mockPost);
    await hidePost(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Post hidden successfully" });
  });

  it('should return 500 if there is an error', async () => {
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
    User.findById.mockRejectedValue(new Error('Test error'));
    await hidePost(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error hidding post", error: 'Test error' });
  });
});