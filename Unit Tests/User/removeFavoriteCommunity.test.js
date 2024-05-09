const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const userController = require("../../controllers/userController");

describe("removeFavoriteCommunity", () => {
  // User and community exist, user is a member of the community, community is favorited
  it("should return an error message when an error occurs while removing favorite community", async () => {
    const req = {
      userId: "validUserId",
      body: {
        subRedditId: "validCommunityId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      favoriteCommunities: ["validCommunityId"],
      communities: ["validCommunityId"],
      save: jest.fn().mockResolvedValue(),
    };
    const community = {
      _id: "validCommunityId",
    };

    User.findById = jest.fn().mockResolvedValue(user);
    SubReddit.findById = jest.fn().mockResolvedValue(community);

    await userController.removeFavoriteCommunity(req, res);

    expect(User.findById).toHaveBeenCalledWith("validUserId");
    expect(SubReddit.findById).toHaveBeenCalledWith("validCommunityId");
    //expect(user.favoriteCommunities).toContain('validCommunityId');
    //expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error unfavoriting community",
      error: expect.any(Error),
    });
  });
  // User ID is not valid
  it("should return error when user ID is not valid", async () => {
    const req = {
      userId: "invalidUserId",
      body: {
        subRedditId: "validCommunityId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue(null);

    await userController.removeFavoriteCommunity(req, res);

    expect(User.findById).toHaveBeenCalledWith("invalidUserId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  // User and community exist, user is a member of the community, community is not favorited
  it("should return an error message when the community is not favorited", async () => {
    const req = {
      userId: "validUserId",
      body: {
        subRedditId: "validCommunityId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      favoriteCommunities: [],
      communities: ["validCommunityId"],
    };
    const community = {
      _id: "validCommunityId",
      name: "Test Community",
    };

    User.findById = jest.fn().mockResolvedValue(user);
    SubReddit.findById = jest.fn().mockResolvedValue(community);

    await userController.removeFavoriteCommunity(req, res);

    expect(User.findById).toHaveBeenCalledWith("validUserId");
    expect(SubReddit.findById).toHaveBeenCalledWith("validCommunityId");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Community not favorited by user",
    });
  });

  // Community ID is not valid
  it("should return an error message when the community ID is not valid", async () => {
    const req = {
      userId: "validUserId",
      body: {
        subRedditId: "invalidCommunityId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      favoriteCommunities: ["validCommunityId"],
      communities: ["validCommunityId"],
    };

    User.findById = jest.fn().mockResolvedValue(user);
    SubReddit.findById = jest.fn().mockResolvedValue(null);

    await userController.removeFavoriteCommunity(req, res);

    expect(User.findById).toHaveBeenCalledWith("validUserId");
    expect(SubReddit.findById).toHaveBeenCalledWith("invalidCommunityId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Community not found" });
  });

  // Error occurred while removing favorite community
  it("should return an error message when an error occurs while removing favorite community", async () => {
    const req = {
      userId: "validUserId",
      body: {
        subRedditId: "validCommunityId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const user = {
      favoriteCommunities: ["validCommunityId"],
      communities: ["validCommunityId"],
      save: jest.fn().mockRejectedValue(new Error("Database error")),
    };
    const community = {
      _id: "validCommunityId",
    };

    User.findById = jest.fn().mockResolvedValue(user);
    SubReddit.findById = jest.fn().mockResolvedValue(community);

    await userController.removeFavoriteCommunity(req, res);

    expect(User.findById).toHaveBeenCalledWith("validUserId");
    expect(SubReddit.findById).toHaveBeenCalledWith("validCommunityId");
    expect(user.favoriteCommunities).toContain("validCommunityId");
    //expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error unfavoriting community",
      error: expect.any(Error),
    });
  });
});
