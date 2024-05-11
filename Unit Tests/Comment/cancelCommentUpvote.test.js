const Comment = require("../../models/comment");
const User = require("../../models/user");
const commentController = require("../../controllers/commentController");

jest.mock("../../models/comment", () => ({
  findById: jest.fn().mockImplementation((id) => {
    const comment = {
      upvotes: 1,
      upvotedUsers: ["user1"],
      save: jest.fn(),
      pull: function (userId) {
        const index = this.upvotedUsers.indexOf(userId);
        if (index !== -1) {
          this.upvotedUsers.splice(index, 1);
        }
      },
    };
    comment.pull = comment.pull.bind(comment);
    return comment;
  }),
}));

jest.mock("../../models/user", () => ({
  findById: jest.fn().mockImplementation((id) => {
    return {
      upvotedComments: ["comment1"],
      save: jest.fn(),
      pull: function (commentId) {
        this.upvotedComments = this.upvotedComments.filter(function (c) {
          return c !== commentId;
        });
      },
    };
  }),
}));

describe("cancelUpvote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if comment not found", async () => {
    Comment.findById.mockResolvedValueOnce(null);
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await commentController.cancelUpvote(
      { userId: "user1", body: { commentId: "comment1" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment not found" });
  });

  it("should return 400 if comment not upvoted by user", async () => {
    Comment.findById.mockResolvedValueOnce({ upvotedUsers: ["user2"] });
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await commentController.cancelUpvote(
      { userId: "user1", body: { commentId: "comment1" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment not upvoted" });
  });

  it("should handle error", async () => {
    Comment.findById.mockRejectedValueOnce(new Error("Test error"));
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await commentController.cancelUpvote(
      { userId: "user1", body: { commentId: "comment1" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error cancelling upvote",
      error: expect.any(Error),
    });
  });
});
