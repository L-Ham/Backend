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
    // it("should return 401 if the password is incorrect", async () => {
    //     const user = {
    //         _id: "user_id",
    //         userName: "testuser",
    //         password: "hashed_password", // Ensure password field is present
    //     };
    //     User.findOne.mockResolvedValueOnce(user);
    //     const errors = {
    //         isEmpty: jest.fn().mockReturnValue(true),
    //     };
    //     validationResult.mockReturnValue(errors);
    //     bcrypt.compare.mockResolvedValueOnce(false);

    //     await authController.login(req, res);

    //     expect(User.findOne).toHaveBeenCalledWith({ userName: "testuser" });
    //     expect(bcrypt.compare).toHaveBeenCalledWith(
    //         "testpassword",
    //         "hashed_password"
    //     );
    //     expect(res.status).toHaveBeenCalledWith(401);
    //     expect(res.json).toHaveBeenCalledWith({
    //         message: "Invalid username or password",
    //     });
    // });


    // it("should return 200 and a token if login is successful", async () => {
    //     const user = {
    //       _id: "user_id",
    //       userName: "testuser",
    //       password: "hashed_password", // Ensure password field is present
    //     };
    //     User.findOne.mockResolvedValueOnce(user);
    //     const errors = {
    //       isEmpty: jest.fn().mockReturnValue(true),
    //     };
    //     validationResult.mockReturnValue(errors);
    //     bcrypt.compare.mockResolvedValueOnce(true);
    //     jwt.sign.mockReturnValueOnce("token");
      
    //     await authController.login(req, res);
      
    //     expect(User.findOne).toHaveBeenCalledWith({ userName: "testuser" });
    //     expect(bcrypt.compare).toHaveBeenCalledWith(
    //       "testpassword",
    //       "hashed_password"
    //     );
    //     expect(jwt.sign).toHaveBeenCalledWith(
    //       { userId: "user_id", userName: "testuser" },
    //       "secret_key",
    //       { expiresIn: "1h" }
    //     );
    //     expect(res.status).toHaveBeenCalledWith(200);
    //     expect(res.json).toHaveBeenCalledWith({ token: "token" });
    //   });
      

    
});
