const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const authController = require("../../controllers/authController");

// Mocking dependencies
jest.mock("express-validator");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../models/user");

describe("login", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        userName: "testuser",
        password: "testpassword",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if there are validation errors", async () => {
    const errors = {
      isEmpty: jest.fn().mockReturnValue(false),
      array: jest.fn().mockReturnValue(["Validation error"]),
    };
    validationResult.mockReturnValue(errors);

    await authController.login(req, res);

    expect(validationResult).toHaveBeenCalledWith(req);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: ["Validation error"] });
  });

  it("should return 400 if user is not found", async () => {
    const user = null;
    User.findOne.mockResolvedValueOnce(user);
    const errors = {
      isEmpty: jest.fn().mockReturnValue(true),
    };
    validationResult.mockReturnValue(errors);
    await authController.login(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ userName: "testuser" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid username or password",
    });
  });

  it("should return 500 if there is a server error", async () => {
    const errors = {
      isEmpty: jest.fn().mockReturnValue(true),
    };
    validationResult.mockReturnValue(errors);
    User.findOne.mockRejectedValueOnce("Error");
    const req = {
      body: {
        userName: "testuser",
        password: "testpassword",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await authController.login(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ userName: "testuser" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });

  it("should return 400 if password is incorrect", async () => {
    const user = {
      _id: "user_id",
      userName: "testuser",
      password: "hashed_password",
    };
    const req = {
      body: {
        userName: "testuser",
        password: "testpassword",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const errors = {
      isEmpty: jest.fn().mockReturnValue(true),
    };
    validationResult.mockReturnValue(errors);
    await authController.login(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ userName: "testuser" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid username or password",
    });

  });
  // it("should return 200 if user is found and password is correct", async () => {
  //   const user = {
  //     _id: "user_id",
  //     userName: "testuser",
  //     password: "hashed_password",
  //   };
  //   const req = {
  //     body: {
  //       userName: "testuser",
  //       password: "testpassword",
  //     },
  //   };
  //   const res = {
  //     status: jest.fn().mockReturnThis(),
  //     json: jest.fn(),
  //   };
  //   const errors = {
  //     isEmpty: jest.fn().mockReturnValue(true),
  //   };
  //   validationResult.mockReturnValue(errors);
  //   User.findOne.mockResolvedValueOnce(user);
  //   bcrypt.compare.mockResolvedValueOnce(true);
  //   console.log(User.findOne);
  //   console.log(User.findOne.mockResolvedValueOnce(user));

  //   jwt.sign.mockImplementation((payload, secret, options, callback) => {
  //     callback(null, "token");
  //   });
  //   await authController.login(req, res);

  //   expect(User.findOne).toHaveBeenCalledWith({ userName: "testuser" });
  //   expect(res.json).toHaveBeenCalledWith({
  //     token: "token",
  //     message: "User logged in successfully",
  //   });
  //   expect(res.status).toHaveBeenCalledWith(200);
  // });
    
});
