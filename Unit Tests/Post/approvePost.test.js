const Post = require("../../models/post");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const postController = require("../../controllers/postController");
const mongoose = require('mongoose');

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

  it("should return 400 if post is already approved", async () => {
    const postId = "post123";
    const userId = "user123";
    const post = { approved: true };
  
    Post.findById.mockResolvedValueOnce(post);
    User.findById.mockResolvedValueOnce({});
  
    const req = {
      body: { postId },
      userId,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await postController.approvePost(req, res);
  
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Post already approved" });
  });
  
  it("should return 404 if subreddit is not found", async () => {
    const postId = "post123";
    const userId = "user123";
    const post = { approved: false, subReddit: "subReddit123" };
  
    Post.findById.mockResolvedValueOnce(post);
    User.findById.mockResolvedValueOnce({});
    SubReddit.findById.mockResolvedValueOnce(null);
  
    const req = {
      body: { postId },
      userId,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    await postController.approvePost(req, res);
  
    expect(SubReddit.findById).toHaveBeenCalledWith(post.subReddit);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });
  
  it("should return 401 if user is not a moderator of the subreddit", async () => {
    const postId = "post123";
    const userId = "user123";
    const post = { approved: false, subReddit: "subReddit123" };
    const subReddit = { moderators: ["user456"] };
  
    Post.findById.mockResolvedValueOnce(post);
    User.findById.mockResolvedValueOnce({});
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
  
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "User not authorized to approve post" });
  });

});