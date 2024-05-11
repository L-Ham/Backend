const User = require("../../models/user");
const userController = require("../../controllers/userController");

describe("updateGender", () => {
  it("should update user gender and return success message", async () => {
    const req = {
      userId: "userId",
      body: {
        gender: "Female",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue({
      gender: "Male",
      save: jest.fn().mockResolvedValue({
        gender: "Female",
      }),
    });

    await userController.updateGender(req, res);

    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User gender updated successfully",
      user: { gender: "Female" },
    });
  });

  it("should return 404 if user is not found", async () => {
    const req = {
      userId: "userId",
      body: {
        gender: "Female",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue(null);

    await userController.updateGender(req, res);

    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 400 if gender is already set to the requested value", async () => {
    const req = {
      userId: "userId",
      body: {
        gender: "Male",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue({
      gender: "Male",
    });

    await userController.updateGender(req, res);

    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Gender is already set to this value",
    });
  });

  it("should return 400 if gender format is invalid", async () => {
    const req = {
      userId: "userId",
      body: {
        gender: "InvalidGender",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue({
      gender: "Male",
    });

    await userController.updateGender(req, res);

    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "Gender format should be Female/Male/I prefer not to say/Empty String",
    });
  });

  it("should handle errors and return 500", async () => {
    const req = {
      userId: "userId",
      body: {
        gender: "Female",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockRejectedValue(new Error("Database error"));

    await userController.updateGender(req, res);

    expect(User.findById).toHaveBeenCalledWith("userId");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to update User Gender",
      error: new Error("Database error"),
    });
  });
});
