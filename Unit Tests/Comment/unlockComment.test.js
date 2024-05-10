const Comment = require("../../models/comment");
const Post = require("../../models/post");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const commentController = require("../../controllers/commentController");

jest.mock("../../models/comment");
jest.mock("../../models/post");
jest.mock("../../models/user");
jest.mock("../../models/subReddit");

describe("unlockComment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should unlock a comment", async () => {
    const userId = "user123";
    const commentId = "comment123";
    const postId = "post123";
    const subRedditId = "subReddit123";

    const comment = { isLocked: true, postId, save: jest.fn() };
    const post = { subReddit: subRedditId };
    const user = {};
    const subReddit = { moderators: [userId] };

    Comment.findById.mockResolvedValueOnce(comment);
    Post.findById.mockResolvedValueOnce(post);
    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(subReddit);

    const req = { userId, body: { commentId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await commentController.unlockComment(req, res);

    expect(Comment.findById).toHaveBeenCalledWith(commentId);
    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(subRedditId);
    expect(comment.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment unlocked" });
  });

  it("should handle comment not found", async () => {
    const userId = "user123";
    const commentId = "comment123";

    Comment.findById.mockResolvedValueOnce(null);

    const req = { userId, body: { commentId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await commentController.unlockComment(req, res);

    expect(Comment.findById).toHaveBeenCalledWith(commentId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment not found" });
  });

  it("should handle comment already unlocked", async () => {
    const userId = "user123";
    const commentId = "comment123";
    const comment = { isLocked: false };

    Comment.findById.mockResolvedValueOnce(comment);

    const req = { userId, body: { commentId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await commentController.unlockComment(req, res);

    expect(Comment.findById).toHaveBeenCalledWith(commentId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment is already unlocked" });
  });

  it("should handle post not belonging to a subreddit", async () => {
    const userId = "user123";
    const commentId = "comment123";
    const comment = { isLocked: true, postId: "post123" };
    const post = { subReddit: null };

    Comment.findById.mockResolvedValueOnce(comment);
    Post.findById.mockResolvedValueOnce(post);

    const req = { userId, body: { commentId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await commentController.unlockComment(req, res);

    expect(Comment.findById).toHaveBeenCalledWith(commentId);
    expect(Post.findById).toHaveBeenCalledWith(comment.postId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "This feature is only available for subreddit moderators" });
  });

  it("should handle user not being a subreddit moderator", async () => {
    const userId = "user123";
    const commentId = "comment123";
    const comment = { isLocked: true, postId: "post123" };
    const post = { subReddit: "subReddit123" };
    const subReddit = { moderators: [] };

    Comment.findById.mockResolvedValueOnce(comment);
    Post.findById.mockResolvedValueOnce(post);
    SubReddit.findById.mockResolvedValueOnce(subReddit);

    const req = { userId, body: { commentId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await commentController.unlockComment(req, res);

    expect(Comment.findById).toHaveBeenCalledWith(commentId);
    expect(Post.findById).toHaveBeenCalledWith(comment.postId);
    expect(SubReddit.findById).toHaveBeenCalledWith(post.subReddit);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "This feature is only available for subreddit moderators" });
  });
});