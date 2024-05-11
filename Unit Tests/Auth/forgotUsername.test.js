const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const authController = require("../../controllers/authController");

jest.mock("nodemailer");

describe("forgetUsername", () => {
    it("should send an email with username", async () => {
      const req = {
        body: {
          email: "test@example.com",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
  
      const user = {
        _id: "userId",
        userName: "testuser",
        email: "test@example.com",
      };
      User.findOne = jest.fn().mockResolvedValue(user);
  
      const transporterSendMailMock = jest.fn((mailOptions, callback) => {
        callback(null);
      });
      nodemailer.createTransport.mockReturnValue({
        sendMail: transporterSendMailMock,
      });
  
      await authController.forgetUsername(req, res);
  
      expect(User.findOne).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(transporterSendMailMock).toHaveBeenCalledWith(
        {
          from: "r75118106@gmail.com",
          to: "test@example.com",
          subject: "So you wanna know your Reddit username, huh?",
          text: expect.stringContaining("Your username is testuser"),
        },
        expect.any(Function)
      );
      expect(res.send).toHaveBeenCalledWith("Email sent");
    });
  
    it("should return 404 if user is not found", async () => {
      const req = {
        body: {
          email: "test@example.com",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
  
      User.findOne = jest.fn().mockResolvedValue(null);
  
      await authController.forgetUsername(req, res);
  
      expect(User.findOne).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("User not found");
    });
  
    it("should return 500 if email sending fails", async () => {
      const req = {
        body: {
          email: "test@example.com",
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
  
      await authController.forgetUsername(req, res);
  
      expect(User.findOne).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(transporterSendMailMock).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to send email: ",
        error: "Failed to send email",
      });
    });
  });