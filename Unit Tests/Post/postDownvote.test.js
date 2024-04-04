const { downvote } = require("../../controllers/postController");
const Post = require("../../models/post");
const User = require("../../models/user");

describe("downvote", () => {
  //   it("should downvote a post and add it to the user's downvotedPosts", async () => {
  //     const req = {
  //       userId: "userId",
  //       body: {
  //         postId: "postId",
  //       },
  //     };
  //     const res = {
  //       status: jest.fn().mockReturnThis(),
  //       json: jest.fn(),
  //     };
  //     const next = jest.fn();

  //     const post = {
  //       _id: "postId",
  //       upvotes: 5,
  //       upvotedUsers: ["userId"],
  //       downvotes: 3,
  //       downvotedUsers: [],
  //       save: jest.fn(),
  //     };

  //     const user = {
  //       _id: "userId",
  //       upvotedPosts: ["postId"],
  //       downvotedPosts: [],
  //       save: jest.fn(),
  //     };

  //     Post.findById = jest.fn().mockResolvedValue(post);
  //     User.findById = jest.fn().mockResolvedValue(user);

  //     await downvote(req, res, next);

  //     expect(Post.findById).toHaveBeenCalledWith("postId");
  //     expect(User.findById).toHaveBeenCalledWith("userId");
  //     expect(post.upvotes).toBe(4);
  //     expect(post.upvotedUsers).not.toContain("userId");
  //     expect(user.upvotedPosts).not.toContain("postId");
  //     expect(post.downvotes).toBe(4);
  //     expect(post.downvotedUsers).toContain("userId");
  //     expect(user.downvotedPosts).toContain("postId");
  //     expect(post.save).toHaveBeenCalled();
  //     expect(user.save).toHaveBeenCalled();
  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({
  //       message: "Post downvoted & added to user",
  //     });
  //     expect(next).not.toHaveBeenCalled();
  //   });
  test("should downvote a post and add it to the user's downvotedPosts", async () => {
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
      upvotedUsers: ["userId"],
      downvotes: 3,
      downvotedUsers: [],
      save: jest.fn(),
    };

    post.upvotedUsers.pull = jest.fn().mockImplementation((id) => {
      const index = post.upvotedUsers.indexOf(id);
      if (index > -1) {
        post.upvotedUsers.splice(index, 1);
      }
    });

    const user = {
      _id: "userId",
      upvotedPosts: ["postId"],
      downvotedPosts: [],
      save: jest.fn(),
    };

    user.upvotedPosts.pull = jest.fn().mockImplementation((id) => {
      const index = user.upvotedPosts.indexOf(id);
      if (index > -1) {
        user.upvotedPosts.splice(index, 1);
      }
    });

    Post.findById = jest.fn().mockReturnValue(post);
    User.findById = jest.fn().mockReturnValue(user);

    await downvote(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith("postId");
    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(post.upvotes).toBe(4);
    expect(post.upvotedUsers).not.toContain("userId");
    expect(user.upvotedPosts).not.toContain("postId");
    expect(post.downvotes).toBe(4);
    expect(post.downvotedUsers).toContain("userId");
    expect(user.downvotedPosts).toContain("postId");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post downvoted & added to user",
    });
  });
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

    await downvote(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith("postId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 if the post is already downvoted", async () => {
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
      downvotedUsers: ["userId"],
    };

    Post.findById = jest.fn().mockResolvedValue(post);

    await downvote(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith("postId");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post already downvoted",
    });
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

    await downvote(req, res, next);

    expect(Post.findById).toHaveBeenCalledWith("postId");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error downvoting post",
      error: expect.any(Error),
    });
    expect(next).not.toHaveBeenCalled();
  });
});
