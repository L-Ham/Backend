const User = require("../../models/user");
const postController = require("../../controllers/postController");

describe("unsavePost", () => {
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

    await postController.unsavePost(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return an error message if the post is not saved in user's profile", async () => {
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

    await postController.unsavePost(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "This post is not saved in your profile",
    });
  });

  it("should return an error message if there is an error unsaving the post", async () => {
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
      savedPosts: [{ equals: jest.fn().mockReturnValue(true) }],
      save: jest.fn().mockRejectedValue(new Error("Database error")),
    });

    await postController.unsavePost(req, res);

    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error unsaving post" });
  });
  it("should return a success message if the post is successfully unsaved", async () => {
    const userId = "user123";
    const postId = "post123";
    const saveMock = jest.fn();
    const user = {
      _id: userId,
      savedPosts: [{ equals: jest.fn().mockReturnValue(true) }],
      save: saveMock,
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

    // Simulate the pull method
    user.savedPosts.pull = function (postId) {
      const postIndex = this.findIndex((post) => post.equals(postId));
      if (postIndex > -1) {
        this.splice(postIndex, 1);
      }
    };

    await postController.unsavePost(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(user.savedPosts.length).toBe(0);
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post unsaved successfully",
    });
  });
});
