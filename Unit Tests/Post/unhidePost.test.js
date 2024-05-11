const { unhidePost } = require("../../controllers/postController");
const Post = require("../../models/post");
const User = require("../../models/user");
const mongoose = require("mongoose");
jest.mock("../../models/post");
jest.mock("../../models/user");

describe("unhidePost", () => {
  const mockPost = {
    _id: "testPostId",
  };

  const mockUser = {
    _id: "testUserId",
    hidePosts: ["testPostId"],
    save: jest.fn(),
  };
  const req = {
    userId: "testUserId",
    body: {
      postId: "testPostId",
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should return 404 if user does not exist", async () => {
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
    User.findById.mockResolvedValue(null);
    await unhidePost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 404 if post does not exist", async () => {
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
    User.findById.mockResolvedValue(mockUser);
    Post.findById.mockResolvedValue(null);
    await unhidePost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post Not Found" });
  });

  it("should return 404 if post is not hidden", async () => {
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
    User.findById.mockResolvedValue({
      ...mockUser,
      hidePosts: [],
    });
    Post.findById.mockResolvedValue(mockPost);
    await unhidePost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "This post is not hidden in your profile",
    });
  });

  it("should return 500 if there is an error", async () => {
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
    User.findById.mockRejectedValue(new Error("Test error"));
    await unhidePost(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error unhidding post" });
  });
});
