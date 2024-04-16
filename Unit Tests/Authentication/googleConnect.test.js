const { googleConnect } = require("../../controllers/authController");
const User = require("../../models/user");
const bcrypt = require("bcryptjs");

jest.mock("../../models/user");
jest.mock("bcryptjs");
describe("googleConnect", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      userId: "testUserId",
      body: {
        password: "testPassword",
      },
      decoded: {
        email: "test@example.com",
      },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("should connect a user to Google", async () => {
    const req = {
      userId: "testUserId",
      body: { password: "password123" },
      decoded: { email: "test@test.com" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const userMock = {
      _id: "testUserId",
      email: "test@test.com",
      password: "hashedPassword",
      signupGoogle: false,
      save: jest.fn().mockResolvedValue({
        _id: "testUserId",
        email: "test@test.com",
        signupGoogle: true,
      }),
    };

    User.findById.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(true);

    await googleConnect(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      req.body.password,
      userMock.password
    );
    expect(userMock.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Google connected successfully",
      user: userMock,
    });
  });
  it("should return 404 if user does not exist", async () => {
    User.findById.mockResolvedValue(null);

    await googleConnect(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("testUserId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 400 if user is already connected to google", async () => {
    const mockUser = {
      _id: "testUserId",
      signupGoogle: true,
    };
    User.findById.mockResolvedValue(mockUser);

    await googleConnect(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("testUserId");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User already connected to google",
    });
  });

  it("should return a 400 status code if password is invalid", async () => {
    const req = { userId: "testUserId", body: { password: "password123" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const userMock = { password: "hashedPassword", signupGoogle: false };
    User.findById.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(false);

    await googleConnect(req, res);

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

    await googleConnect(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("testUserId");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error Connecting google",
      error: "Database error",
    });
  });
});
