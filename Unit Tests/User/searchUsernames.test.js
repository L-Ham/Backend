const { searchUsernames } = require("../../controllers/userController");
const User = require("../../models/user");

jest.mock("../../models/user");

describe("searchUsernames", () => {
  it("should return matching usernames with block status", async () => {
    const req = {
      query: { search: "test" },
      userId: "userId",
    };

    const res = { json: jest.fn() };

    const userMock = {
      _id: "userId",
      blockUsers: [
        { blockedUserId: "blockedUserId1" },
        { blockedUserId: "blockedUserId2" },
      ],
    };

    const matchingUsernames = [
      {
        _id: "matchingUserId1",
        userName: "testUser1",
        avatarImage: "avatar1",
        isBlocked: false,
      },
      {
        _id: "matchingUserId2",
        userName: "testUser2",
        avatarImage: "avatar2",
        isBlocked: false,
      },
    ];

    User.findById.mockResolvedValue(userMock);
    User.find.mockResolvedValue(matchingUsernames);

    await searchUsernames(req, res);

    const expectedResponse = {
      matchingUsernames: [
        {
          isBlocked: false,
        },
        {
          isBlocked: false,
        },
      ],
    };

    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(User.find).toHaveBeenCalledWith(
      { userName: /^test/i, _id: { $ne: "userId" } },
      "_id userName avatarImage"
    );
    expect(res.json).toHaveBeenCalledWith(expectedResponse);
  });

  it("should return a 404 status code if user is not found", async () => {
    const req = {
      query: { search: "test" },
      userId: "userId",
    };

    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findById.mockResolvedValue(null);

    await searchUsernames(req, res);

    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return a 500 status code if an error occurs", async () => {
    const req = {
      query: { search: "test" },
      userId: "userId",
    };

    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findById.mockRejectedValue(new Error("Database error"));

    await searchUsernames(req, res);

    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error searching usernames",
      error: new Error("Database error"),
    });
  });
});
