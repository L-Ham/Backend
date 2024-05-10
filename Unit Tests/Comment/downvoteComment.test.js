const Comment = require("../../models/comment");
const User = require("../../models/user");
const commentController = require("../../controllers/commentController");

jest.mock("../../models/comment", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

describe('downvote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle comment not found', async () => {
    const req = { userId: 'user123', body: { commentId: 'comment123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Comment.findById.mockResolvedValueOnce(null);

    await commentController.downvote(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Comment not found' });
  });

  it('should handle comment already downvoted', async () => {
    const req = { userId: 'user123', body: { commentId: 'comment123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const comment = {
      downvotedUsers: ['user123'],
    };

    Comment.findById.mockResolvedValueOnce(comment);

    await commentController.downvote(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Comment already downvoted' });
  });

  it('should handle comment previously upvoted', async () => {
    const req = { userId: 'user123', body: { commentId: 'comment123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const comment = {
      upvotedUsers: ['user123'],
      downvotedUsers: [],
      upvotes: 1,
      downvotes: 0,
      save: jest.fn(),
    };

    const user = {
      upvotedComments: ['comment123'],
      downvotedComments: [],
      save: jest.fn(),
    };

    Comment.findById.mockResolvedValueOnce(comment);
    User.findById.mockResolvedValueOnce(user);

    await commentController.downvote(req, res);

    expect(comment.upvotes).toBe(0);
    expect(comment.downvotes).toBe(0);
    expect(user.downvotedComments).not.toContain('comment123');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error downvoting comment', error: expect.any(Error) });
});

  it('should handle new downvote', async () => {
    const req = { userId: 'user123', body: { commentId: 'comment123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const comment = {
      upvotedUsers: [],
      downvotedUsers: [],
      upvotes: 0,
      downvotes: 0,
      save: jest.fn(),
    };

    const user = {
      upvotedComments: [],
      downvotedComments: [],
      save: jest.fn(),
    };

    Comment.findById.mockResolvedValueOnce(comment);
    User.findById.mockResolvedValueOnce(user);

    await commentController.downvote(req, res);

    expect(comment.downvotes).toBe(1);
    expect(user.downvotedComments).toContain('comment123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Comment downvoted & added to user' });
  });

  it('should handle server error', async () => {
    const req = { userId: 'user123', body: { commentId: 'comment123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Comment.findById.mockRejectedValueOnce(new Error('Server error'));

    await commentController.downvote(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error downvoting comment', error: new Error('Server error') });
});
});