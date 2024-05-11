const Comment = require("../../models/comment");
const User = require("../../models/user");
const commentController = require("../../controllers/commentController");

jest.mock("../../models/comment", () => ({
  findById: jest.fn().mockImplementation((id) => {
    const comment = {
      downvotes: 1,
      downvotedUsers: ["user1"],
      save: jest.fn().mockImplementation(function () {
        this.downvotes -= 1;
      }),
      pull: function (userId) {
        const index = this.downvotedUsers.indexOf(userId);
        if (index !== -1) {
          this.downvotedUsers.splice(index, 1);
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
      downvotedComments: ["comment1"],
      save: jest.fn(),
      pull: function (commentId) {
        this.downvotedComments = this.downvotedComments.filter(function (c) {
          return c !== commentId;
        });
      },
    };
  }),
}));

describe("cancelDownvote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if comment not found", async () => {
    Comment.findById.mockResolvedValueOnce(null);
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await commentController.cancelDownvote(
      { userId: "user1", body: { commentId: "comment1" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment not found" });
  });

  it("should return 400 if comment not downvoted by user", async () => {
    Comment.findById.mockResolvedValueOnce({ downvotedUsers: ["user2"] });
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await commentController.cancelDownvote(
      { userId: "user1", body: { commentId: "comment1" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment not downvoted" });
  });

  it("should handle error", async () => {
    Comment.findById.mockRejectedValueOnce(new Error("Test error"));
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await commentController.cancelDownvote(
      { userId: "user1", body: { commentId: "comment1" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error cancelling downvote",
      error: expect.any(Error),
    });
  });
});
