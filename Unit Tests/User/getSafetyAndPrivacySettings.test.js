const User = require("../../models/user");
const userController = require("../../controllers/userController");
describe("getSafetyAndPrivacySettings", () => {
  // Retrieve safety and privacy settings for a valid user ID
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should retrieve safety and privacy settings for a valid user ID", async () => {
    const req = { userId: "validUserId" };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    User.findById = jest.fn().mockResolvedValue({
      blockUsers: true,
      muteCommunities: false,
    });

    await userController.getSafetyAndPrivacySettings(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("validUserId");
    expect(res.json).toHaveBeenCalledWith({
      safetyAndPrivacySettings: {
        blockUsers: true,
        muteCommunities: false,
      },
    });
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // Return an error response if user ID is not provided
  it("should return an error response if user ID is not provided", () => {
    const req = { userId: null };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    userController.getSafetyAndPrivacySettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User Id not provided" });
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // Return an error response if user ID is invalid
  it("should return an error response if user ID is invalid", async () => {
    const req = { userId: "invalidUserId" };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    User.findById = jest.fn().mockResolvedValue(null);

    await userController.getSafetyAndPrivacySettings(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("invalidUserId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});
