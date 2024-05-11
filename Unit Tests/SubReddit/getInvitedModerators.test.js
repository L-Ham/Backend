const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const UserUploadModel = require("../../models/userUploads");
const subredditController = require("../../controllers/subredditController");

jest.mock("../../models/user", () => ({
  find: jest.fn(),
  findById: jest.fn(),
}));

jest.mock("../../models/subReddit", () => ({
  findOne: jest.fn(),
}));

jest.mock("../../models/userUploads", () => ({
  findOne: jest.fn(),
}));

describe("getInvitedModerators", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return subreddit invited moderators if subreddit and user exist", async () => {
    const subredditName = "subreddit123";
    const userId = "user123";
    const subreddit = { 
      name: subredditName, 
      invitedModerators: ["moderator1", "moderator2"] 
    };
    const user = { _id: userId, userName: "user1" };
    const invitedModerators = [
      { _id: "moderator1", userName: "mod1", avatarImage: "image1" },
      { _id: "moderator2", userName: "mod2", avatarImage: "image2" },
    ];
    const userUploads = [
      { _id: "image1", url: "url1" },
      { _id: "image2", url: "url2" },
    ];

    SubReddit.findOne.mockResolvedValueOnce(subreddit);
    User.findById.mockResolvedValueOnce(user);
    User.find.mockResolvedValueOnce(invitedModerators);
    UserUploadModel.findOne.mockResolvedValueOnce(userUploads[0])
      .mockResolvedValueOnce(userUploads[1]);

    const req = { query: { subredditName }, userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getInvitedModerators(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(User.find).toHaveBeenCalledWith({ _id: { $in: subreddit.invitedModerators } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Retrieved subreddit invited moderators",
      invitedModerators: [
        { _id: "moderator1", userName: "mod1", avatarImage: "url1" },
        { _id: "moderator2", userName: "mod2", avatarImage: "url2" },
      ],
    });
  });

  it("should handle error if subreddit is not found", async () => {
    const subredditName = "subreddit123";
    const userId = "user123";

    SubReddit.findOne.mockResolvedValueOnce(null);

    const req = { query: { subredditName }, userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getInvitedModerators(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Subreddit not found" });
  });

  it("should handle error if user is not found", async () => {
    const subredditName = "subreddit123";
    const userId = "user123";
    const subreddit = { 
      name: subredditName, 
      invitedModerators: ["moderator1", "moderator2"] 
    };

    SubReddit.findOne.mockResolvedValueOnce(subreddit);
    User.findById.mockResolvedValueOnce(null);

    const req = { query: { subredditName }, userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getInvitedModerators(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should handle server error", async () => {
    const subredditName = "subreddit123";
    const userId = "user123";
    const errorMessage = "Some error message";

    SubReddit.findOne.mockRejectedValueOnce(new Error(errorMessage));

    const req = { query: { subredditName }, userId };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await subredditController.getInvitedModerators(req, res);

    expect(SubReddit.findOne).toHaveBeenCalledWith({ name: subredditName });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error getting invited moderators",
      error: errorMessage,
    });
  });
});