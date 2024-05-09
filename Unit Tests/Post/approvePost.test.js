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

  // Add more test cases for other scenarios...

});