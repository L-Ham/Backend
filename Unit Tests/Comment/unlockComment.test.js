const Comment = require("../../models/comment");
const User = require("../../models/user");
const Post = require("../../models/post");
const SubReddit = require("../../models/subReddit");
const commentController = require("../../controllers/commentController");

jest.mock("../../models/comment", () => ({
  findById: jest.fn(),
}));
jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));
jest.mock("../../models/post", () => ({
  findById: jest.fn(),
}));
jest.mock("../../models/subreddit", () => ({
  findById: jest.fn(),
}));

describe('unlockComment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should unlock the comment and return success message', async () => {
    const userId = 'user123';
    const commentId = 'comment123';
    const comment = {
      isLocked: true,
      postId: 'post123',
      save: jest.fn(),
    };
    const user = {};
    const post = {
      subReddit: 'subreddit123',
    };
    const subReddit = {
      moderators: [userId],
    };
    Comment.findById.mockResolvedValueOnce(comment);
    User.findById.mockResolvedValueOnce(user);
    Post.findById.mockResolvedValueOnce(post);
    SubReddit.findById.mockResolvedValueOnce(subReddit);

    const req = { userId, body: { commentId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await commentController.unlockComment(req, res);

    expect(Comment.findById).toHaveBeenCalledWith(commentId);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(Post.findById).toHaveBeenCalledWith(comment.postId);
    expect(SubReddit.findById).toHaveBeenCalledWith(post.subReddit);
    expect(comment.isLocked).toBe(false);
    expect(comment.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Comment unlocked' });
  });

  it('should return 404 if comment is not found', async () => {
    const userId = 'user123';
    const commentId = 'comment123';
    Comment.findById.mockResolvedValueOnce(null);

    const req = { userId, body: { commentId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await commentController.unlockComment(req, res);

    expect(Comment.findById).toHaveBeenCalledWith(commentId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Comment not found' });
  });

  it('should return 400 if comment is already unlocked', async () => {
    const userId = 'user123';
    const commentId = 'comment123';
    const comment = {
      isLocked: false,
    };
    Comment.findById.mockResolvedValueOnce(comment);

    const req = { userId, body: { commentId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await commentController.unlockComment(req, res);

    expect(Comment.findById).toHaveBeenCalledWith(commentId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Comment is already unlocked' });
  });

  it('should return 400 if user is not a subreddit moderator', async () => {
    const userId = 'user123';
    const commentId = 'comment123';
    const comment = {
      isLocked: true,
      postId: 'post123',
    };
    const user = {};
    const post = {
      subReddit: 'subreddit123',
    };
    const subReddit = {
      moderators: ['moderator456'],
    };
    Comment.findById.mockResolvedValueOnce(comment);
    User.findById.mockResolvedValueOnce(user);
    Post.findById.mockResolvedValueOnce(post);
    SubReddit.findById.mockResolvedValueOnce(subReddit);

    const req = { userId, body: { commentId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await commentController.unlockComment(req, res);

    expect(Comment.findById).toHaveBeenCalledWith(commentId);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(Post.findById).toHaveBeenCalledWith(comment.postId);
    expect(SubReddit.findById).toHaveBeenCalledWith(post.subReddit);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'This feature is only available for subreddit moderators' });
  });

  it('should handle server error', async () => {
    const userId = 'user123';
    const commentId = 'comment123';
    const errorMessage = 'Some error message';
    Comment.findById.mockRejectedValueOnce(new Error(errorMessage));

    const req = { userId, body: { commentId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await commentController.unlockComment(req, res);

    expect(Comment.findById).toHaveBeenCalledWith(commentId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error unlocking comment', error: new Error(errorMessage) });
  });
});