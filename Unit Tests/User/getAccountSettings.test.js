const User = require("../../models/user");
const userController = require("../../controllers/userController");
User.findById = jest.fn();

describe("getAccountSettings", () => {
  it("should return account settings when user ID is valid", async () => {
    // Arrange
    const req = { userId: "validUserId" };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    const user = {
      email: "test@example.com",
      gender: "male",
      signupGoogle: true,
    };
    User.findById.mockResolvedValueOnce(user);

    // Act
    await userController.getAccountSettings(req, res);

    // Assert
    expect(User.findById).toHaveBeenCalledWith("validUserId");
    expect(res.json).toHaveBeenCalledWith({
      accountSettings: {
        email: "test@example.com",
        gender: "male",
        connectedToGoogle: true,
      },
    });
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return 404 error when user ID is null", async () => {
    // Arrange
    const req = { userId: null };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    await userController.getAccountSettings(req, res);
    expect(User.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return 404 error when user ID is invalid", async () => {
    // Arrange
    const req = { userId: "invalidUserId" };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    User.findById.mockResolvedValueOnce(null);
    await userController.getAccountSettings(req, res);
    expect(User.findById).toHaveBeenCalledWith("invalidUserId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});
