// postController.test.js
const { unlockPost } = require("../../controllers/postController");
const Post = require("../../models/post");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const mongoose = require("mongoose");
jest.mock("../../models/post");
jest.mock("../../models/user");
jest.mock("../../models/subReddit");

describe("unlockPost", () => {
  const mockPost = {
    _id: "testPostId",
    user: "testUserId",
    subReddit: "testSubRedditId",
    isLocked: true,
    save: jest.fn(),
  };
  const mockUser = {
    _id: "testUserId",
  };
  const mockSubreddit = {
    _id: "testSubredditId",
    moderators: ["testUserId"],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if postId is not provided", async () => {
    const req = {
      userId: "testUserId",
      body: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await unlockPost(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing postId in request body",
    });
  });

  it("should return 404 if post does not exist", async () => {
    const req = {
      userId: "testUserId",
      body: {
        postId: "nonexistentPostId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Post.findById.mockResolvedValue(null);
    await unlockPost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
  });

  it("should return 404 if user does not exist", async () => {
    const req = {
      userId: "nonexistentUserId",
      body: {
        postId: "testPostId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Post.findById.mockResolvedValue(mockPost);
    User.findById.mockResolvedValue(null);
    await unlockPost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 404 if subreddit does not exist", async () => {
    const req = {
      userId: "testUserId",
      body: {
        postId: "testPostId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Post.findById.mockResolvedValue(mockPost);
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(null);
    await unlockPost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "SubReddit not found" });
  });

  it("should return 400 if post is already unlocked", async () => {
    const req = {
      userId: "testUserId",
      body: {
        postId: "testPostId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const unlockedPost = { ...mockPost, isLocked: false };
    Post.findById.mockResolvedValue(unlockedPost);
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    await unlockPost(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post is already unlocked",
    });
  });

  it("should return 200 if post is unlocked successfully", async () => {
    const req = {
      userId: "testUserId",
      body: {
        postId: "testPostId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Post.findById.mockResolvedValue(mockPost);
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    await unlockPost(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post unlocked successfully",
    });
  });

  it("should return 500 if there is an error unlocking the post", async () => {
    const req = {
      userId: "testUserId",
      body: {
        postId: "testPostId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    Post.findById.mockRejectedValue(new Error("Test error"));
    await unlockPost(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error unlocking post",
      error: "Test error",
    });
  });
});
