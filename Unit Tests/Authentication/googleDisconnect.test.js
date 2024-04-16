const { googleDisconnect } = require("../../controllers/authController");
const User = require("../../models/user");
const bcrypt = require("bcryptjs");

jest.mock("../../models/user");
jest.mock("bcryptjs");

describe("googleDisconnect", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      userId: "testUserId",
      body: {
        password: "testPassword",
      },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("should disconnect user from google if user exists, signed up using google, and password is valid", async () => {
    const mockUser = {
      _id: "testUserId",
      signupGoogle: true,
      password: "hashedPassword",
      save: jest.fn(),
    };
    User.findById.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    await googleDisconnect(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("testUserId");
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "testPassword",
      "hashedPassword"
    );
    expect(mockUser.signupGoogle).toBe(false);
    expect(mockUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Google disconnected successfully",
    });
  });

  it("should return 404 if user does not exist", async () => {
    User.findById.mockResolvedValue(null);

    await googleDisconnect(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("testUserId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 400 if user didn't sign up using google", async () => {
    const mockUser = {
      _id: "testUserId",
      signupGoogle: false,
    };
    User.findById.mockResolvedValue(mockUser);

    await googleDisconnect(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("testUserId");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User didn't signup using google signup",
    });
  });

  it("should return a 400 status code if password is invalid", async () => {
    const req = { userId: "testUserId", body: { password: "password123" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const userMock = { password: "hashedPassword", signupGoogle: true };
    User.findById.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(false);

    await googleDisconnect(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      req.body.password,
      userMock.password
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid password" });
  });

  it("should handle server error", async () => {
    User.findById.mockRejectedValue(new Error("Database error"));

    await googleDisconnect(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("testUserId");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error disconnecting google",
      error: "Database error",
    });
  });
});
