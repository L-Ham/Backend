const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const UserUploadModel = require("../../models/userUploads");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/user", () => ({
  find: jest.fn(),
}));

jest.mock("../../models/subReddit", () => ({
  findOne: jest.fn(),
}));

jest.mock("../../models/userUploads", () => ({
  findOne: jest.fn(),
}));

describe("getPendingMembers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return subreddit pending members if subreddit exists", async () => {
    const subredditName = "subreddit123";
    const subreddit = { 
      name: subredditName, 
      pendingMembers: ["member1", "member2"] 
    };
    const members = [
      { _id: "member1", userName: "mem1", avatarImage: "image1" },
      { _id: "member2", userName: "mem2", avatarImage: "image2" },
    ];
    const userUploads = [
      { _id: "image1", url: "url1" },
      { _id: "image2", url: "url2" },
    ];

    SubReddit.findOne.mockResolvedValueOnce(subreddit);
    User.find.mockResolvedValueOnce(members);
    UserUploadModel.findOne.mockResolvedValueOnce(userUploads[0])
      .mockResolvedValueOnce(userUploads[1]);

    const req = { query: { subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getPendingMembers(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(User.find).toHaveBeenCalledWith({ _id: { $in: subreddit.pendingMembers } });
    expect(res.json).toHaveBeenCalledWith({
      message: "Retrieved subreddit Pending Users Successfully",
      pendingMembers: [
        { _id: "member1", userName: "mem1", avatarImage: "url1" },
        { _id: "member2", userName: "mem2", avatarImage: "url2" },
      ],
    });
  });

  it("should handle error if subreddit is not found", async () => {
    const subredditName = "subreddit123";

    SubReddit.findOne.mockResolvedValueOnce(null);

    const req = { query: { subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getPendingMembers(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it("should handle server error", async () => {
    const subredditName = "subreddit123";
    const errorMessage = "Some error message";

    SubReddit.findOne.mockRejectedValueOnce(new Error(errorMessage));

    const req = { query: { subredditName } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getPendingMembers(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error getting subreddit Members",
      error: errorMessage,
    });
  });
});