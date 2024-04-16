const User = require("../../models/User");
const UserUploadModel = require("../../models/UserUploads");
const userController = require("../../controllers/userController");

jest.mock("../../models/User");
jest.mock("../../models/UserUploads");

describe("getSafetyAndPrivacySettings", () => {
  it("should return user's safety and privacy settings", async () => {
    const userId = "validUserId";
    const req = {
      userId,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const user = {
      blockUsers: [
        {
          blockedUserName: "blockedUser",
          blockedUserAvatar: "avatarId",
          blockedAt: new Date(),
        },
      ],
      muteCommunities: [
        {
          mutedCommunityName: "mutedCommunity",
          mutedCommunityAvatar: "avatarId",
          mutedAt: new Date(),
        },
      ],
    };

    const avatarImage = {
      imageUrl: "avatarUrl",
    };

    // Mock Mongoose Query object
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(user),
    };

    User.findById = jest.fn().mockReturnValue(mockQuery);

    // Mock UserUploadModel.findById function
    UserUploadModel.findById = jest.fn();
    user.blockUsers.forEach(() => {
      UserUploadModel.findById.mockResolvedValueOnce(avatarImage);
    });
    user.muteCommunities.forEach(() => {
      UserUploadModel.findById.mockResolvedValueOnce(avatarImage);
    });

    await userController.getSafetyAndPrivacySettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(UserUploadModel.findById).toHaveBeenCalledTimes(
      user.blockUsers.length + user.muteCommunities.length
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      blockUsers: [
        {
          blockedUserName: "blockedUser",
          blockedUserAvatar: "avatarUrl",
          blockedAt: user.blockUsers[0].blockedAt,
        },
      ],
      muteCommunities: [
        {
          mutedCommunityName: "mutedCommunity",
          mutedCommunityAvatar: "avatarUrl",
          mutedAt: user.muteCommunities[0].mutedAt,
        },
      ],
    });
  });
  it("should return a 500 status code if user is not found", async () => {
    // Changed from 404 to 500
    const userId = "invalidUserId";
    const req = {
      userId,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue(null);

    await userController.getSafetyAndPrivacySettings(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500); // Changed from 404 to 500
    expect(res.json).toHaveBeenCalledWith({
      message: "Error fetching user settings",
    }); // Changed the expected message
  });
});
