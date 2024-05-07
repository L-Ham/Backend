const Post = require("../../models/post");
const postController = require("../../controllers/postController");

jest.mock("../../models/post", () => ({
  findById: jest.fn(),
}));

describe("getAllPostComments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return all comments for a valid post ID", async () => {
    const postId = "post123";
    const comments = [
      { text: "Comment 1" },
      { text: "Comment 2" },
      { text: "Comment 3" },
    ];
    const post = {
      comments: comments,
    };
    // Mock the return value of findById and populate
    Post.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValueOnce(post),
    });
    const req = { body: { postId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await postController.getAllPostComments(req, res);

    expect(Post.findById).toHaveBeenCalledWith(postId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Comments retrieved successfully", comments: comments });
  });

    it("should return 404 if post ID is invalid", async () => {
        const postId = "post123";
        // Mock the return value of findById and populate
        Post.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValueOnce(null),
        });
        const req = { body: { postId } };
        const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        };
    
        await postController.getAllPostComments(req, res);
    
        expect(Post.findById).toHaveBeenCalledWith(postId);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
    });

    it("should return 500 if there is an error", async () => {
        const postId = "post123";
        Post.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValueOnce("Error"),
        });
        const req = { body: { postId } };
        const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        };
    
        await postController.getAllPostComments(req, res);
    
        expect(Post.findById).toHaveBeenCalledWith(postId);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Error getting comments for post" });
    });




  
});
