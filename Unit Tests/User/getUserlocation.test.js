const User = require("../../models/user");
const userController = require("../../controllers/userController");

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
}));

describe("getUserLocation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve user location and return success message", async () => {
    const userId = "user123";
    const location = "New York";
    const user = {
      location,
    };
    User.findById.mockResolvedValueOnce(user);

    const req = {
      userId,
    };
    const res = {
      json: jest.fn(),
    };

    await userController.getUserLocation(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.json).toHaveBeenCalledWith({
      message: "User location retrieved successfully",
      location,
    });
  });

  it("should return 404 if user is not found", async () => {
    const userId = "user123";
    User.findById.mockResolvedValueOnce(null);

    const req = {
      userId,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.getUserLocation(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should handle server error", async () => {
    const userId = "user123";
    const errorMessage = "Some error message";
    User.findById.mockRejectedValueOnce(new Error(errorMessage));

    const req = {
      userId,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.getUserLocation(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error retrieving user location",
      error: new Error(errorMessage),
    });
  });
});