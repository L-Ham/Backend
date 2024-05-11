const Post = require("../../models/post");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const postController = require("../../controllers/postController");

jest.mock("../../models/post", () => ({
  findById: jest.fn(),
}));
jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));
jest.mock("../../models/subReddit", () => ({
  findById: jest.fn(),
}));

describe('reportPost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should report a post successfully', async () => {
    const postId = 'post123';
    const userId = 'user123';
    const post = { approved: false, save: jest.fn() };
    const user = {};
    const subreddit = { reportedPosts: [], save: jest.fn() };

    Post.findById.mockResolvedValueOnce(post);
    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(subreddit);

    const req = { body: { postId }, userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await postController.reportPost(req, res);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.json).toHaveBeenCalledWith({ message: "Post reported successfully" });
  });

  it('should handle error if post is not found', async () => {
    const postId = 'post123';
    const userId = 'user123';

    Post.findById.mockResolvedValueOnce(null);

    const req = { body: { postId }, userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await postController.reportPost(req, res);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
  });

  it('should handle error if user is not found', async () => {
    const postId = 'post123';
    const userId = 'user123';
    const post = { approved: false, save: jest.fn() };

    Post.findById.mockResolvedValueOnce(post);
    User.findById.mockResolvedValueOnce(null);

    const req = { body: { postId }, userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await postController.reportPost(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should handle error if subreddit is not found', async () => {
    const postId = 'post123';
    const userId = 'user123';
    const post = { approved: false, save: jest.fn() };
    const user = {};

    Post.findById.mockResolvedValueOnce(post);
    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(null);

    const req = { body: { postId }, userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await postController.reportPost(req, res);

    expect(SubReddit.findById).toHaveBeenCalledWith(post.subReddit);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Subreddit not found' });
  });

  it('should handle server error', async () => {
    const postId = 'post123';
    const userId = 'user123';
    const errorMessage = 'Some error message';

    Post.findById.mockRejectedValueOnce(new Error(errorMessage));

    const req = { body: { postId }, userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await postController.reportPost(req, res);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error reporting post' });
  });
  
});