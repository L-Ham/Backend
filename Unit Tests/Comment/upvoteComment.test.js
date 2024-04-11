const Comment = require("../../models/comment");
const User = require("../../models/user");
const commentController = require("../../controllers/commentController");

describe("upvote", () => {
  it("should upvote a comment and add it to the user", async () => {
    const req = {
      userId: "userId",
      body: {
        commentId: "commentId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    Comment.findById = jest.fn().mockResolvedValue({
      upvotedUsers: [],
      downvotedUsers: [],
      upvotes: 0,
      downvotes: 0,
      save: jest.fn(),
    });

    User.findById = jest.fn().mockResolvedValue({
      upvotedComments: [],
      downvotedComments: [],
      save: jest.fn(),
    });

    await commentController.upvote(req, res, next);

    expect(Comment.findById).toHaveBeenCalledWith("commentId");
    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comment upvoted & added to user",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 404 if comment is not found", async () => {
    const req = {
      userId: "userId",
      body: {
        commentId: "commentId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    Comment.findById = jest.fn().mockResolvedValue(null);

    await commentController.upvote(req, res, next);

    expect(Comment.findById).toHaveBeenCalledWith("commentId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment not found" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 if comment is already upvoted", async () => {
    const req = {
      userId: "userId",
      body: {
        commentId: "commentId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    Comment.findById = jest.fn().mockResolvedValue({
      upvotedUsers: ["userId"],
      downvotedUsers: [],
      save: jest.fn(),
    });

    await commentController.upvote(req, res, next);

    expect(Comment.findById).toHaveBeenCalledWith("commentId");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comment already upvoted",
    });
    expect(next).not.toHaveBeenCalled();
  });
//   it("should remove downvote and update upvote if comment is already downvoted", async () => {
//     const req = {
//       userId: "userId",
//       body: { commentId: "commentId" },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     const next = jest.fn();

//     const comment = {
//       _id: "commentId",
//       upvotedUsers: [],
//       downvotedUsers: ["userId"],
//       upvotes: 1, // Set upvotes to 1
//       downvotes: 1, // Set downvotes to 0
//       save: jest.fn().mockResolvedValue(),
//     };
//     Comment.findById = jest.fn().mockResolvedValue(comment);

//     const user = {
//       _id: "userId",
//       upvotedComments: [],
//       downvotedComments: ["commentId"],
//       save: jest.fn().mockImplementation(function () {
//         this.downvotedComments = this.downvotedComments.filter(
//           (id) => id !== "commentId"
//         );
//         return Promise.resolve(this);
//       }),
//     };
//     User.findById = jest.fn().mockResolvedValue(user);

//     await commentController.upvote(req, res, next);

//     expect(Comment.findById).toHaveBeenCalledWith("commentId");
//     expect(User.findById).toHaveBeenCalledWith("userId");
//     expect(comment.downvotes).toBe(0);
//     expect(comment.upvotes).toBe(1);
//     // expect(user.downvotedComments).not.toContain("commentId");
//     // expect(user.upvotedComments).toContain("commentId");
//     expect(res.status).toHaveBeenCalledWith(200);
//   });

  it("should handle errors and return 500", async () => {
    const req = {
      userId: "userId",
      body: {
        commentId: "commentId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    Comment.findById = jest.fn().mockRejectedValue(new Error("Database error"));

    await commentController.upvote(req, res, next);

    expect(Comment.findById).toHaveBeenCalledWith("commentId");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error upvoting Comment",
      error: expect.any(Error),
    });
    expect(next).not.toHaveBeenCalled();
  });
});
