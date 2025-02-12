const { upvote } = require("../../controllers/postController");
const Post = require("../../models/post");
const User = require("../../models/user");

describe("upvote", () => {
  const req = {
    userId: "userId",
    body: {
      postId: "postId",
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  const post = {
    _id: "postId",
    upvotes: 5,
    upvotedUsers: [],
    downvotes: 3,
    downvotedUsers: [],
    save: jest.fn(),
  };

  const user = {
    _id: "userId",
    upvotedPosts: [],
    downvotedPosts: [],
    save: jest.fn(),
  };

  Post.findById = jest.fn().mockResolvedValue(post);
  User.findById = jest.fn().mockResolvedValue(user);
  it("should return 404 if the post is not found", async () => {
    const req = {
      userId: "userId",
      body: {
        postId: "postId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    Post.findById = jest.fn().mockResolvedValue(null);

    await upvote(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith("postId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 if the post is already upvoted", async () => {
    const req = {
      userId: "userId",
      body: {
        postId: "postId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    const post = {
      _id: "postId",
      upvotedUsers: ["userId"],
    };

    Post.findById = jest.fn().mockResolvedValue(post);

    await upvote(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith("postId");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Post already upvoted" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle errors and return 500", async () => {
    const req = {
      userId: "userId",
      body: {
        postId: "postId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    Post.findById = jest.fn().mockRejectedValue(new Error("Database error"));

    await upvote(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith("postId");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error upvoting post",
      error: "Database error"
    });
    expect(next).not.toHaveBeenCalled();
  });
});
