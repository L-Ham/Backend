const {
  getPopularCommunities,
} = require("../../controllers/subredditController");
const SubReddit = require("../../models/subReddit");
const UserUploadModel = require("../../models/userUploads");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

jest.mock("../../models/subReddit");
jest.mock("../../models/userUploads");

describe("getPopularCommunities", () => {
  it("should return popular communities", async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const avatarImageId1 = new ObjectId(123456789012);
    const avatarImageId2 = new ObjectId(123456789013);

    const communitiesMock = [
      {
        _id: "community1",
        name: "Community 1",
        members: ["member1", "member2"],
        appearance: { avatarImage: avatarImageId1 },
      },
      {
        _id: "community2",
        name: "Community 2",
        members: ["member1"],
        appearance: { avatarImage: avatarImageId2 },
      },
    ];

    UserUploadModel.find.mockResolvedValue([
      { _id: avatarImageId1, url: "url1" },
      { _id: avatarImageId2, url: "url2" },
    ]);

    SubReddit.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(communitiesMock),
    });
    UserUploadModel.find.mockResolvedValue([
      { _id: avatarImageId1, url: "url1" },
      { _id: avatarImageId2, url: "url2" },
    ]);

    await getPopularCommunities(req, res);

    expect(SubReddit.find).toHaveBeenCalled();

    expect(UserUploadModel.find).toHaveBeenCalledWith({
      _id: {
        $in: [avatarImageId1, avatarImageId2],
      },
    });
    expect(res.json).toHaveBeenCalledWith({
      popularCommunities: [
        {
          communityId: "community1",
          name: "Community 1",
          memberCount: 2,
          avatarImageUrl: "url1",
        },
        {
          communityId: "community2",
          name: "Community 2",
          memberCount: 1,
          avatarImageUrl: "url2",
        },
      ],
    });
  });

  it("should return a 500 status code if an error occurs", async () => {
    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    SubReddit.find.mockImplementation((query) => {
      if (query) {
        return {
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(communitiesMock),
        };
      } else {
        return Promise.resolve([]);
      }
    });

    await getPopularCommunities(req, res);

    expect(SubReddit.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error getting popular communities",
    });
  });
});
