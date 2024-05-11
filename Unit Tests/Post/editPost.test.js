const Post = require("../../models/post");
const postController = require("../../controllers/postController");

jest.mock("../../models/post", () => ({
  findById: jest.fn().mockImplementation((id) => {
    const post = {
      user: "user1",
      type: "text",
      text: "old text",
      save: jest.fn().mockResolvedValueOnce(),
    };
    return Promise.resolve(post);
  }),
}));

describe("editPost", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if post not found", async () => {
    Post.findById.mockResolvedValueOnce(null);
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await postController.editPost(
      { userId: "user1", body: { postId: "post1", text: "new text" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
  });

  it("should return 401 if user not authorized to edit post", async () => {
    Post.findById.mockResolvedValueOnce({ user: "user2", text: "old text" });
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await postController.editPost(
      { userId: "user1", body: { postId: "post1", text: "new text" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not authorized to edit post",
    });
  });

  it("should return 400 if post type is link", async () => {
    Post.findById.mockResolvedValueOnce({
      user: "user1",
      type: "link",
      text: "old text",
    });
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await postController.editPost(
      { userId: "user1", body: { postId: "post1", text: "new text" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Url posts can't be edited",
    });
  });

  it("should return 400 if post text is not present", async () => {
    Post.findById.mockResolvedValueOnce({ user: "user1", type: "text" });
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await postController.editPost(
      { userId: "user1", body: { postId: "post1", text: "new text" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Text posts can't be edited",
    });
  });

  it("should return 400 if request body does not contain text", async () => {
    Post.findById.mockResolvedValueOnce({
      user: "user1",
      type: "text",
      text: "old text",
    });
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await postController.editPost(
      { userId: "user1", body: { postId: "post1" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Text field is required for editing",
    });
  });
});
