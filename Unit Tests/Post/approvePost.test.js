const Post = require("../../models/post");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const postController = require("../../controllers/postController");

// Mocking the required models and functions
jest.mock("../../models/post", () => ({
  findById: jest.fn(),
}));
jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));
jest.mock("../../models/subReddit", () => ({
  findById: jest.fn(),
}));

describe("approvePost", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should approve a post successfully", async () => {
    const postId = "post123";
    const userId = "user123";
    const post = {
      approved: false,
      disapproved: false,
      subReddit: "subReddit123",
      save: jest.fn(),
    };
    const user = {};
    const subReddit = {
      moderators: [userId],
    };

    Post.findById.mockResolvedValueOnce(post);
    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(subReddit);

    const req = {
      body: { postId },
      userId,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await postController.approvePost(req, res);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(post.subReddit);
    expect(post.approved).toBe(true);
    expect(post.approvedBy).toBe(userId);
    expect(post.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Post approved successfully" });
  });

  it("should return 404 if post is not found", async () => {
    const postId = "post123";
    const userId = "user123";

    Post.findById.mockResolvedValueOnce(null);

    const req = {
      body: { postId },
      userId,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await postController.approvePost(req, res);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
  });

  it("should return 404 if user is not found", async () => {
    const postId = "post123";
    const userId = "user123";
    const post = {};

    Post.findById.mockResolvedValueOnce(post);
    User.findById.mockResolvedValueOnce(null);

    const req = {
      body: { postId },
      userId,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await postController.approvePost(req, res);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  // Add more test cases for other scenarios...

});