const { markAsNSFW } = require("../../controllers/postController");
const Post = require("../../models/post");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");

describe("markAsNSFW", () => {
  it("should mark a post as NSFW successfully when user is authorized", async () => {
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

    await markAsNSFW(req, res);

    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(SubReddit.findById).toHaveBeenCalledWith("subReddit123");
    expect(post.isNSFW).toBe(true);
    expect(post.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post marked as NSFW",
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

    await markAsNSFW(req, res);

    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
  });

  it("should return 400 if post is already marked as NSFW", async () => {
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
    };

    Post.findById = jest.fn().mockResolvedValue(post);

    await markAsNSFW(req, res);

    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post is already marked as NSFW",
    });
  });

  it("should return 404 if user is not found", async () => {
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

    Post.findById = jest.fn().mockResolvedValue({});
    User.findById = jest.fn().mockResolvedValue(null);

    await markAsNSFW(req, res);

    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 401 if user is not authorized to mark post as NSFW", async () => {
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
      user: "user456",
    };

    Post.findById = jest.fn().mockResolvedValue(post);
    User.findById = jest.fn().mockResolvedValue({});

    await markAsNSFW(req, res);

    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not authorized to mark post as NSFW",
    });
  });

  it("should return 401 if user is not authorized to mark post as NSFW in subreddit", async () => {
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

    await markAsNSFW(req, res);

    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(SubReddit.findById).toHaveBeenCalledWith("subReddit123");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not authorized to mark post as NSFW",
    });
  });

  it("should handle errors when marking post as NSFW", async () => {
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

    await markAsNSFW(req, res);

    expect(Post.findById).toHaveBeenCalledWith("post123");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error Marking post as NSFW",
    });
  });
});
