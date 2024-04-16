const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const authController = require("../../controllers/authController");

describe("googleLogin", () => {
  it("should return a 404 error when the user is not found", async () => {
    const req = {
      decoded: {
        email: "test@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne = jest.fn().mockResolvedValue(null);

    await authController.googleLogin(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return a 404 error when the user didn't signup using google signup", async () => {
    const req = {
      decoded: {
        email: "test@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne = jest.fn().mockResolvedValue({
      signupGoogle: false,
    });

    await authController.googleLogin(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "User didn't signup using google signup",
    });
  });

  it("should return a JWT token and user details when the user is found and signed up using google signup", async () => {
    const req = {
      decoded: {
        email: "test@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUser = {
      _id: "userId",
      email: "test@example.com",
      userName: "testUser",
      signupGoogle: true,
    };

    User.findOne = jest.fn().mockResolvedValue(mockUser);
    jwt.sign = jest.fn().mockReturnValue("mockToken");

    await authController.googleLogin(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(jwt.sign).toHaveBeenCalledWith(
      {
        user: {
          id: mockUser._id,
          email: mockUser.email,
          userName: mockUser.userName,
          type: "google",
        },
        exp: expect.any(Number),
      },
      process.env.JWT_SECRET
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User logged in successfully",
      token: "mockToken",
      user: mockUser,
    });
  });
  it("should return a 500 error when there is an error during Google login", async () => {
    const req = {
      decoded: {
        email: "test@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne = jest.fn().mockRejectedValue(new Error("Database error"));

    await authController.googleLogin(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Google login failed",
      error: "Database error",
    });
  });
});
