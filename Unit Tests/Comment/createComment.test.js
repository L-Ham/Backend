const commentController = require("../../controllers/commentController");
const User = require("../../models/user");
const Post = require("../../models/post");
const Comment = require("../../models/comment");
const UserUpload = require("../../models/userUploads");

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/post", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/comment", () => ({
  findById: jest.fn(),
  mockImplementation: () => ({
    save: jest.fn().mockResolvedValue({
      _id: "savedCommentId",
    }),
  }),
}));

jest.mock("../../models/userUploads", () => ({
  uploadMedia: jest.fn(),
}));

describe("createComment", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      userId: "validUserId",
      body: {
        postId: "validPostId",
        text: "validText",
        parentCommentId: null,
        isHidden: false,
      },
      files: [],
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return an error message when user is not found", async () => {
    User.findById.mockResolvedValue(null);

    await commentController.createComment(req, res);

    expect(User.findById).toHaveBeenCalledWith("validUserId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return an error message when post is not found", async () => {
    User.findById.mockResolvedValue({});
    Post.findById.mockResolvedValue(null);

    await commentController.createComment(req, res);

    expect(User.findById).toHaveBeenCalledWith("validUserId");
    expect(Post.findById).toHaveBeenCalledWith("validPostId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
  });

  // it("should return an error message when creating a comment with a locked post and non-moderator user", async () => {
  //   User.findById.mockResolvedValue({});
  //   Post.findById.mockResolvedValue({
  //     _id: "validPostId",
  //     subReddit: "validSubRedditId",
  //     isLocked: true,
  //   });

  //   await commentController.createComment(req, res);

  //   expect(User.findById).toHaveBeenCalledWith("validUserId");
  //   expect(Post.findById).toHaveBeenCalledWith("validPostId");
  //   expect(res.status).toHaveBeenCalledWith(400);
  //   expect(res.json).toHaveBeenCalledWith({ message: "Post is locked" });
  // });

  it("should return an error message when comment text is not provided", async () => {
    User.findById.mockResolvedValue({});
    Post.findById.mockResolvedValue({});
    req.body.text = "";

    await commentController.createComment(req, res);

    expect(User.findById).toHaveBeenCalledWith("validUserId");
    expect(Post.findById).toHaveBeenCalledWith("validPostId");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment text is required" });
  });

  // it("should create a comment successfully", async () => {
  //   User.findById.mockResolvedValue({});
  //   Post.findById.mockResolvedValue({});
  //   UserUpload.uploadMedia.mockResolvedValue("uploadedMediaId");

  //   await commentController.createComment(req, res);

  //   expect(User.findById).toHaveBeenCalledWith("validUserId");
  //   expect(Post.findById).toHaveBeenCalledWith("validPostId");
  //   expect(Comment).toHaveBeenCalledWith({
  //     postId: "validPostId",
  //     userId: "validUserId",
  //     text: "validText",
  //     parentCommentId: null,
  //     replies: [],
  //     votes: 0,
  //     isHidden: false,
  //   });
  //   expect(res.json).toHaveBeenCalledWith({
  //     message: "Comment Created successfully",
  //     savedComment: {
  //       _id: "savedCommentId",
  //     },
  //   });
  // });

  // Add more test cases as needed
});