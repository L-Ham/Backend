const { unmarkAsNSFW } = require("../../controllers/postController");
const Post = require("../../models/post");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");

describe("unmarkAsNSFW", () => {
  it("should unmark a post as NSFW successfully when user is authorized", async () => {
    const req = {
      userId: "user123",
      body: {
        postId: "post123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const post = {
      isNSFW: true,
      user: "user123",
      subReddit: "subReddit123",
      save: jest.fn(),
    };

    const user = {
      _id: "user123",
    };

    const postSubreddit = {
      moderators: ["user123"],
    };

    Post.findById = jest.fn().mockResolvedValue(post);
    User.findById = jest.fn().mockResolvedValue(user);
    SubReddit.findById = jest.fn().mockResolvedValue(postSubreddit);

    await unmarkAsNSFW(req, res);

    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(SubReddit.findById).toHaveBeenCalledWith("subReddit123");
    expect(post.isNSFW).toBe(false);
    expect(post.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post unmarked as NSFW",
    });
  });

  it("should return 404 if post is not found", async () => {
    const req = {
      userId: "user123",
      body: {
        postId: "post123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Post.findById = jest.fn().mockResolvedValue(null);

    await unmarkAsNSFW(req, res);

    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
  });

  it("should return 400 if post is not marked as NSFW", async () => {
    const req = {
      userId: "user123",
      body: {
        postId: "post123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const post = {
      isNSFW: false,
    };

    Post.findById = jest.fn().mockResolvedValue(post);

    await unmarkAsNSFW(req, res);

    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post is not marked as NSFW",
    });
  });

  test("should return 404 if user is not found", async () => {
    const req = {
      userId: "user123",
      body: {
        postId: "post123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Post.findById = jest.fn().mockResolvedValue({
      user: "user123",
      isNSFW: true,
      save: jest.fn(),
    });

    User.findById = jest.fn().mockResolvedValue(null);

    await unmarkAsNSFW(req, res);

    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 401 if user is not authorized to unmark post as NSFW", async () => {
    const req = {
      userId: "user123",
      body: {
        postId: "post123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const post = {
      isNSFW: true,
      user: "user456",
    };

    Post.findById = jest.fn().mockResolvedValue(post);
    User.findById = jest.fn().mockResolvedValue({});

    await unmarkAsNSFW(req, res);

    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not authorized to unmark post as NSFW",
    });
  });

  it("should return 401 if user is not authorized to unmark post as NSFW in subreddit", async () => {
    const req = {
      userId: "user123",
      body: {
        postId: "post123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const post = {
      isNSFW: true,
      user: "user123",
      subReddit: "subReddit123",
    };

    const user = {
      _id: "user123",
    };

    const postSubreddit = {
      moderators: ["user456"],
    };

    Post.findById = jest.fn().mockResolvedValue(post);
    User.findById = jest.fn().mockResolvedValue(user);
    SubReddit.findById = jest.fn().mockResolvedValue(postSubreddit);

    await unmarkAsNSFW(req, res);

    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(SubReddit.findById).toHaveBeenCalledWith("subReddit123");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not authorized to unmark post as NSFW",
    });
  });

  it("should handle errors when unmarking post as NSFW", async () => {
    const req = {
      userId: "user123",
      body: {
        postId: "post123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Post.findById = jest.fn().mockRejectedValue(new Error("Post not found"));

    await unmarkAsNSFW(req, res);

    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error Unmarking post as NSFW",
    });
  });
});
