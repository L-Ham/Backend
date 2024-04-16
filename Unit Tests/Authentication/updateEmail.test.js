const { updateEmail } = require("../../controllers/authController");
const User = require("../../models/user");
const bcrypt = require("bcryptjs");

jest.mock("../../models/User");
jest.mock("bcryptjs");

describe("updateEmail", () => {
  it("should update a user's email", async () => {
    const req = {
      userId: "testUserId",
      body: { password: "password123", email: "new@test.com" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const userMock = {
      _id: "testUserId",
      password: "hashedPassword",
      email: "test@test.com",
      save: jest
        .fn()
        .mockResolvedValue({ _id: "testUserId", email: "new@test.com" }),
    };

    User.findById.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(true);

    await updateEmail(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      req.body.password,
      userMock.password
    );
    expect(userMock.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Email updated successfully",
    });
  });

  it("should return a 400 status code if email or password is not provided", async () => {
    const req = { userId: "testUserId", body: { password: "password123" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updateEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email & Password cannot be empty",
    });
  });

  it("should return a 404 status code if user does not exist", async () => {
    const req = {
      userId: "testUserId",
      body: { password: "password123", email: "new@test.com" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findById.mockResolvedValue(null);

    await updateEmail(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return a 400 status code if password is invalid", async () => {
    const req = {
      userId: "testUserId",
      body: { password: "password123", email: "new@test.com" },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const userMock = { password: "hashedPassword" };
    User.findById.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(false);

    await updateEmail(req, res);

    expect(User.findById).toHaveBeenCalledWith(req.userId);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      req.body.password,
      userMock.password
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid password" });
  });
});
