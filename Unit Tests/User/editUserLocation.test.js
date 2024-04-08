const User = require("../../models/user");
const userController = require("../../controllers/userController");

jest.mock("../../models/user", () => ({
  findById: jest.fn(),
  save: jest.fn(),
}));

describe("editUserLocation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update user location and return success message", async () => {
    const userId = "user123";
    const location = "New York";
    const user = {
      location: "Los Angeles",
      save: jest.fn(),
    };
    User.findById.mockResolvedValueOnce(user);

    const req = {
      userId,
      body: { location },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.editUserLocation(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(user.location).toBe(location);
    expect(user.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "User location updated successfully",
      user,
    });
  });

  it("should return 404 if user is not found", async () => {
    const userId = "user123";
    User.findById.mockResolvedValueOnce(null);

    const req = {
      userId,
      body: { location: "New York" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.editUserLocation(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 400 if location is already set to the provided value", async () => {
    const userId = "user123";
    const location = "Los Angeles";
    const user = {
      location,
    };
    User.findById.mockResolvedValueOnce(user);

    const req = {
      userId,
      body: { location },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.editUserLocation(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Location is already set to this value",
    });
  });

  it("should handle server error", async () => {
    const userId = "user123";
    const location = "New York";
    const errorMessage = "Some error message";
    User.findById.mockRejectedValueOnce(new Error(errorMessage));

    const req = {
      userId,
      body: { location },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await userController.editUserLocation(req, res);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error updating user location",
      error: new Error(errorMessage),
    });
  });
});