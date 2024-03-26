const Post = require("../../models/post");
const postController = require("../../routes/postController");

jest.mock("../models/Post");

describe("unlockPost", () => {
  it("should unlock a post", async () => {
    // Arrange
    const postId = "123";
    const post = {
      isLocked: true,
      save: jest.fn().mockResolvedValueOnce(),
    };
    Post.findById = jest.fn().mockResolvedValueOnce(post);
    await postController.unlockPost(postId);

    // Assert
    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(post.isLocked).toBe(false);
    expect(post.save).toHaveBeenCalled();
  });
});
