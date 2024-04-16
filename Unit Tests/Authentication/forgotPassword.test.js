const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const authController = require("../../controllers/authController");

jest.mock("nodemailer");

describe("forgetPassword", () => {
  it("should send an email with password reset link", async () => {
    const req = {
      body: {
        email: "test@example.com",
        username: "testuser",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const user = {
      _id: "userId",
      userName: "testuser",
      email: "test@example.com",
    };
    User.findOne = jest.fn().mockResolvedValue(user);

    const token = "testToken";
    jwt.sign = jest.fn().mockReturnValue(token);

    const transporterSendMailMock = jest.fn((mailOptions, callback) => {
      callback(null);
    });
    nodemailer.createTransport.mockReturnValue({
      sendMail: transporterSendMailMock,
    });

    await authController.forgetPassword(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
      userName: "testuser",
    });
    expect(jwt.sign).toHaveBeenCalledWith(
      {
        user: {
          id: "userId",
          userName: "testuser",
          email: "test@example.com",
          type: "normal",
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: 500000000000 }
    );
    expect(transporterSendMailMock).toHaveBeenCalledWith(
      {
        from: "r75118106@gmail.com",
        to: "test@example.com",
        subject: "Reddit password reset",
        text: expect.stringContaining("Hi testuser"),
      },
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Email sent" });
  });

  it("should return 404 if user is not found", async () => {
    const req = {
      body: {
        email: "test@example.com",
        username: "testuser",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne = jest.fn().mockResolvedValue(null);

    await authController.forgetPassword(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
      userName: "testuser",
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 500 if email sending fails", async () => {
    const req = {
      body: {
        email: "test@example.com",
        username: "testuser",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    const user = {
      _id: "userId",
      userName: "testuser",
      email: "test@example.com",
    };
    User.findOne = jest.fn().mockResolvedValue(user);
  
    const transporterSendMailMock = jest.fn((mailOptions, callback) => {
      callback(new Error("Failed to send email"));
    });
    nodemailer.createTransport.mockReturnValue({
      sendMail: transporterSendMailMock,
    });
  
    await authController.forgetPassword(req, res);
  
    expect(User.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
      userName: "testuser",
    });
    expect(transporterSendMailMock).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to send email",
    });
  });
  
});