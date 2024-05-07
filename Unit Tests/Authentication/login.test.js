const { login } = require("../../controllers/authController");
const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

jest.mock("../../models/user");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("express-validator");

describe("login", () => {
  it("should log in a user", async () => {
    const req = {
      body: {
        userName: "testUser",
        password: "password123",
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockResolvedValue({ password: "hashedPassword" });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockImplementation((payload, secret, options, callback) =>
      callback(null, "token")
    );

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      $or: [{ userName: req.body.userName }, { email: req.body.email }],
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      req.body.password,
      "hashedPassword"
    );
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      token: "token",
      message: "User logged in successfully",
    });
  });

  it("should return a 400 status code if validation errors exist", async () => {
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => ["error"],
    });

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: ["error"] });
  });

  it("should return a 400 status code if user does not exist", async () => {
    const req = { body: { userName: "testUser", password: "password123" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockResolvedValue(null);

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      $or: [{ userName: req.body.userName }, { email: req.body.email }],
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid username/email or password",
    });
  });

  it("should return a 400 status code if password does not match", async () => {
    const req = { body: { userName: "testUser", password: "password123" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockResolvedValue({ password: "hashedPassword" });
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      $or: [{ userName: req.body.userName }, { email: req.body.email }],
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      req.body.password,
      "hashedPassword"
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid username/email or password",
    });
  });

  it("should return a 500 status code if an error occurs", async () => {
    const req = { body: { userName: "testUser", password: "password123" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockRejectedValue(new Error("Database error"));

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      $or: [{ userName: req.body.userName }, { email: req.body.email }],
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error",
      error: "Database error",
    });
  });
});
