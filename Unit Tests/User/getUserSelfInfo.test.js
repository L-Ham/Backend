const User = require("../../models/user");
const UserUploadModel = require("../../models/userUploads");
const userController = require("../../controllers/userController");

describe("getUserSelfInfo", () => {
  it("should return 404 if user is not found", async () => {
    const req = { userId: "test" };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findById = jest.fn().mockResolvedValue(null);

    await userController.getUserSelfInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return user details if user is found", async () => {
    const req = { userId: "test" };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockUser = {
      _id: "123",
      userName: "test",
      createdAt: new Date(),
      avatarImage: "456",
      bannerImage: "789",
      profileSettings: new Map([["displayName", "Test User"], ["about", "About Test"]]),
      upvotedComments: [],
      downvotedComments: [],
      upvotedPosts: [],
      downvotedPosts: [],
    };
    const mockImage = { _id: "456", url: "http://example.com/image.jpg" };

    User.findById = jest.fn().mockResolvedValue(mockUser);
    UserUploadModel.findById = jest.fn().mockResolvedValue(mockImage);

    await userController.getUserSelfInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      user: {
        userId: mockUser._id,
        displayName: mockUser.profileSettings.get("displayName"),
        username: mockUser.userName,
        commentKarma: mockUser.upvotedComments.length - mockUser.downvotedComments.length,
        created: Math.floor(mockUser.createdAt.getTime() / 1000),
        postKarma: mockUser.upvotedPosts.length - mockUser.downvotedPosts.length,
        avatar: mockImage.url,
        banner: mockImage.url,
        About: mockUser.profileSettings.get("about"),
      },
    });
  });

  it("should return 500 if there is an error retrieving user", async () => {
    const req = { userId: "test" };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findById = jest.fn().mockRejectedValue(new Error("Database error"));

    await userController.getUserSelfInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error retrieving user" });
  });
});