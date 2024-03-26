const User = require("../../models/user");
const userController = require("../../controllers/userController");
const subReddit = require("../../models/subReddit");

describe("muteCommunity", () => {
  // Successfully mute a community for a user
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully mute a community for a user", async () => {
    const req = {
      userId: "user123",
      body: {
        subRedditId: "community123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValueOnce({
      mutedCommunities: [],
      save: jest.fn().mockResolvedValueOnce(true),
    });
    subReddit.findById = jest.fn().mockResolvedValueOnce(true);

    await userController.muteCommunity(req, res);

    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(subReddit.findById).toHaveBeenCalledWith("community123");
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Community muted successfully",
      user: expect.any(Object),
    });
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return a 500 error if there is a server error", async () => {
    const req = {
      userId: "user123",
      body: {
        subRedditId: "community123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockRejectedValueOnce(new Error("Server error"));

    await userController.muteCommunity(req, res);

    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error retrieving user:",
      error: expect.any(Error),
    });
  });
});
