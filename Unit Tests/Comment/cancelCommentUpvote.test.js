const Comment = require("../../models/comment");
const User = require("../../models/user");
const commentController = require("../../controllers/commentController");

jest.mock("../../models/Comment", () => ({
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

jest.mock("../../models/User", () => ({
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

  // it("should cancel upvote successfully", async () => {
  //   const comment = {
  //     upvotes: 1,
  //     upvotedUsers: ["user1"],
  //     save: jest.fn(),
  //     pull: function (userId) {
  //       this.upvotedUsers = this.upvotedUsers.filter(function (u) {
  //         return u !== userId;
  //       });
  //     },
  //   };
  //   const user = {
  //     upvotedComments: ["comment1"],
  //     save: jest.fn(),
  //     pull: function (commentId) {
  //       this.upvotedComments = this.upvotedComments.filter(function (c) {
  //         return c !== commentId;
  //       });
  //     },
  //   };
  //   Comment.findById.mockResolvedValueOnce(comment);
  //   User.findById.mockResolvedValueOnce(user);
  //   const res = {
  //     status: jest.fn().mockReturnThis(),
  //     json: jest.fn(),
  //   };
  //   await commentController.cancelUpvote(
  //     { userId: "user1", body: { commentId: "comment1" } },
  //     res
  //   );
  //   expect(comment.upvotes).toBe(0);
  //   expect(comment.upvotedUsers).toEqual([]);
  //   expect(comment.save).toHaveBeenCalled();
  //   expect(user.upvotedComments).toEqual([]);
  //   expect(user.save).toHaveBeenCalled();
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith({ message: "Upvote cancelled" });
  // });

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
