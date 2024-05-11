const User = require("../../models/user");
const Post = require("../../models/post");
const postController = require("../../controllers/postController");

describe("savePost", () => {
  it("should return an error message if user is not found", async () => {
    const userId = "user123";
    const postId = "post123";
    const req = {
      userId,
      body: { postId },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue(null);

    await postController.savePost(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return an error message if the post is not found", async () => {
    const userId = "user123";
    const postId = "post123";
    const user = {
      _id: userId,
      savedPosts: [],
    };
    const req = {
      userId,
      body: { postId },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue(user);
    Post.findById = jest.fn().mockResolvedValue(null);

    await postController.savePost(req, res);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post Not Found" });
  });

  it("should return an error message if the post is already saved", async () => {
    const userId = "user123";
    const postId = "post123";
    const user = {
      _id: userId,
      savedPosts: [{ equals: jest.fn().mockReturnValue(true) }],
    };
    const post = {
      _id: postId,
    };
    const req = {
      userId,
      body: { postId },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue(user);
    Post.findById = jest.fn().mockResolvedValue(post);

    await postController.savePost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "This post is already saved in your profile",
    });
  });

  it("should return a success message if the post is successfully saved", async () => {
    const userId = "user123";
    const postId = "post123";
    const saveMock = jest.fn();
    const user = {
      _id: userId,
      savedPosts: [{ equals: jest.fn().mockReturnValue(false) }],
      save: saveMock,
    };
    const post = {
      _id: postId,
    };
    const req = {
      userId,
      body: { postId },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue(user);
    Post.findById = jest.fn().mockResolvedValue(post);

    await postController.savePost(req, res);

    expect(user.savedPosts.length).toBe(2);
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Post saved successfully" });
  });

  it("should return an error message if there is an error saving the post", async () => {
    const req = {
      userId: "user123",
      body: {
        postId: "validPostId",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue({
      savedPosts: [{ equals: jest.fn().mockReturnValue(false) }],
      save: jest.fn().mockRejectedValue(new Error("Database error")),
    });

    await postController.savePost(req, res);

    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error saving post" });
  });
});