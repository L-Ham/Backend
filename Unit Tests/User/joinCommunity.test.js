const User = require("../../models/user");
const SubReddit = require("../../models/subReddit");
const userController = require("../../controllers/userController");

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
  save: jest.fn(),
}));

jest.mock("../../models/subReddit", () => ({
  findById: jest.fn(),
  save: jest.fn(),
}));

describe("joinCommunity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if user is not found", async () => {
    User.findById.mockResolvedValueOnce(null);

    const req = {
      userId: "user123",
      body: { subRedditId: "community123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.joinCommunity(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 404 if community is not found", async () => {
    User.findById.mockResolvedValueOnce({});
    SubReddit.findById.mockResolvedValueOnce(null);

    const req = {
      userId: "user123",
      body: { subRedditId: "community123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.joinCommunity(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Community not found" });
  });
});
