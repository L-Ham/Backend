const postController = require("../../controllers/postController");
const Post = require("../../models/post");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const UserUpload = require("../../controllers/userUploadsController");

jest.mock("../../models/post");
jest.mock("../../models/user");
jest.mock("../../models/subReddit");
jest.mock("../../controllers/userUploadsController");

describe("deletePost", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { postId: "postId" },
      userId: "userId",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return 400 if postId is missing", async () => {
    req.body.postId = undefined;
    await postController.deletePost(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Missing postId in request body" });
  });

  it("should return 404 if post is not found", async () => {
    Post.findById.mockResolvedValue(null);
    await postController.deletePost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
  });

  it("should return 401 if user is not authorized to delete post", async () => {
    Post.findById.mockResolvedValue({ user: { toString: () => "anotherUserId" } });
    await postController.deletePost(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "User not authorized to delete post" });
  });

  it("should return 404 if subreddit is not found", async () => {
    Post.findById.mockResolvedValue({ user: { toString: () => "userId" }, subReddit: "subRedditId" });
    SubReddit.findById.mockResolvedValue(null);
    await postController.deletePost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "SubReddit not found" });
  });

  it("should return 404 if user is not found", async () => {
    Post.findById.mockResolvedValue({ user: { toString: () => "userId" } });
    User.findById.mockResolvedValue(null);
    await postController.deletePost(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should delete post successfully", async () => {
    const post = { 
      user: { toString: () => "userId" }, 
      images: ["imageId"], 
      videos: ["videoId"], 
      subReddit: "subRedditId" 
    };
    Post.findById.mockResolvedValue(post);
    User.findById.mockResolvedValue({ posts: { pull: jest.fn() }, save: jest.fn() });
    SubReddit.findById.mockResolvedValue({ posts: { pull: jest.fn() }, save: jest.fn() });
    UserUpload.destroyMedia.mockResolvedValue();
    Post.findByIdAndDelete.mockResolvedValue();
    await postController.deletePost(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Post deleted successfully" });
  });

  it("should return 500 if there is an error", async () => {
    Post.findById.mockRejectedValue(new Error());
    await postController.deletePost(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error deleting post" });
  });
});