const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authService = require("../../services/authServices");
const authController = require("../../controllers/authController");

jest.mock("../../models/user");
jest.mock("jsonwebtoken");
jest.mock("bcryptjs");
jest.mock("../../services/authServices");

describe("googleSignUp", () => {
  it("should return a 500 error when the user already exists", async () => {
    const req = {
      decoded: {
        email: "test@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };

    User.findOne = jest.fn().mockResolvedValue({});

    await authController.googleSignUp(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Email already Exists" });
  });

  it("should create a new user and return a JWT token when the user does not exist", async () => {
    const req = {
      decoded: {
        email: "test@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };

    const mockUser = {
        _id: "userId",
        email: "test@example.com",
        userName: "testUser",
      };
      
      mockUser.save = jest.fn().mockResolvedValue(mockUser);

    User.findOne = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    User.mockImplementation(() => mockUser);
    authService.generateRandomUsername = jest.fn().mockReturnValue(["testUser"]);
    bcrypt.genSalt = jest.fn().mockResolvedValue("salt");
    bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
    jwt.sign = jest.fn().mockReturnValue("mockToken");

    await authController.googleSignUp(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(User.findOne).toHaveBeenCalledWith({ userName: "testUser" });
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith(expect.any(String), "salt");
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalledWith("session-token", "mockToken");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User Signup Successfully",
      user: mockUser,
      token: "mockToken",
    });
  });

  it("should return a 500 error when there is an error during Google signup", async () => {
    const req = {
      decoded: {
        email: "test@example.com",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };

    User.findOne = jest.fn().mockRejectedValue(new Error("Database error"));

    await authController.googleSignUp(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Google Sign Up Failed",
      error: "Database error",
    });
  });
});