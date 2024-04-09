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

describe("removePost", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should remove a post successfully", async () => {
    const postId = "post123";
    const userId = "user123";
    const post = {
      subReddit: "subReddit123",
      save: jest.fn(),
    };
    const user = {};
    const subReddit = {
      moderators: [userId],
      removedPosts: [],
      save: jest.fn(),
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

    await postController.removePost(req, res);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(post.subReddit);
    expect(post.disapproved).toBe(true);
    expect(post.disapprovedBy).toBe(userId);
    expect(post.save).toHaveBeenCalled();
    expect(subReddit.removedPosts).toContain(postId);
    expect(subReddit.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Post removed successfully" });
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

    await postController.removePost(req, res);

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

    await postController.removePost(req, res);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 404 if subreddit is not found", async () => {
    const postId = "post123";
    const userId = "user123";
    const post = {};
    const user = {};

    Post.findById.mockResolvedValueOnce(post);
    User.findById.mockResolvedValueOnce(user);
    SubReddit.findById.mockResolvedValueOnce(null);

    const req = {
      body: { postId },
      userId,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await postController.removePost(req, res);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(post.subReddit);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it("should return 401 if user is not authorized to remove post", async () => {
    const postId = "post123";
    const userId = "user123";
    const post = {};
    const user = {};
    const subReddit = {
      moderators: [],
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

    await postController.removePost(req, res);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(post.subReddit);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "User not authorized to remove post" });
  });

  it("should return 400 if post is already approved", async () => {
    const postId = "post123";
    const userId = "user123";
    const post = {
      approved: true,
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

    await postController.removePost(req, res);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(post.subReddit);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Post already approved" });
  });

  it("should return 400 if post is already disapproved", async () => {
    const postId = "post123";
    const userId = "user123";
    const post = {
      disapproved: true,
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

    await postController.removePost(req, res);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(SubReddit.findById).toHaveBeenCalledWith(post.subReddit);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Post already disapproved" });
  });



});