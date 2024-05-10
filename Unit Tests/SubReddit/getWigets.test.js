const { getWidget } = require("../../controllers/subredditController");
const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const UserUploadModel = require("../../models/userUploads");

jest.mock("../../models/user");
jest.mock("../../models/subReddit");
jest.mock("../../models/userUploads");

describe("getWidget", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      userId: "testUserId",
      query: {
        subredditId: "testSubredditId",
      },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });it("should return subreddit widgets if user and subreddit exist", async () => {
    const mockUser = { _id: "testUserId", userName: "testUser", avatarImage: "testAvatarImageId" };
    const mockSubreddit = {
      _id: "testSubredditId",
      moderators: ["testUserId"],
      appearance: { avatarImage: "testAvatarImageId", bannerImage: "testBannerImageId" },
      members: ["testUserId"],
      textWidgets: [],
      bookMarks: [],
      rules: [],
      orderWidget: [],
      createdAt: new Date(),
      name: "testSubreddit",
      description: "testDescription",
      membersNickname: "testMembersNickname",
      currentlyViewingNickname: "testCurrentlyViewingNickname",
    };
    const mockAvatarImage = { _id: "testAvatarImageId", url: "testAvatarImageUrl" };
    const mockBannerImage = { _id: "testBannerImageId", url: "testBannerImageUrl" };
  
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(mockSubreddit);
    UserUploadModel.findById.mockImplementation((id) => {
      switch (id) {
        case "testAvatarImageId":
          return mockAvatarImage;
        case "testBannerImageId":
          return mockBannerImage;
        default:
          return null;
      }
    });
  
    await getWidget(req, res, next);
  
    expect(res.json).toHaveBeenCalledWith({
      message: "Subreddit widgets retrieved successfully",
      communityDetails: {
        name: mockSubreddit.name,
        subredditId: mockSubreddit._id,
        avatarImage: mockAvatarImage.url,
        bannerImage: mockBannerImage.url,
        description: mockSubreddit.description,
        membersNickname: mockSubreddit.membersNickname,
        membersCount: mockSubreddit.members.length,
        currentlyViewingNickname: mockSubreddit.currentlyViewingNickname,
        currentlyViewingCount: expect.any(Number),
        isMember: true,
        createdAt: Math.floor(mockSubreddit.createdAt.getTime() / 1000),
      },
      textWidgets: expect.any(Object),
      bookMarks: expect.any(Object),
      moderators: [
        {
          username: mockUser.userName,
          avatarImage: mockAvatarImage.url,
        },
      ],
      rules: mockSubreddit.rules,
      orderWidget: mockSubreddit.orderWidget,
    });
  });

  it("should handle error if user is not found", async () => {
    User.findById.mockResolvedValue(null);

    await getWidget(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should handle error if subreddit is not found", async () => {
    const mockUser = { _id: "testUserId" };
    User.findById.mockResolvedValue(mockUser);
    SubReddit.findById.mockResolvedValue(null);

    await getWidget(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it("should handle server error", async () => {
    User.findById.mockRejectedValue(new Error());

    await getWidget(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "",
      message: "Error getting subreddit widgets",
    });
  });
});
