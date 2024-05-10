const authService = require("../../services/authServices");
const authController = require("../../controllers/authController");
const { error } = require("console");

describe("generateUserName", () => {
  it("should generate random usernames and return a 200 status code", async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const userNames = ["username1", "username2", "username3"];
    authService.generateRandomUsername = jest.fn().mockResolvedValue(userNames);

    await authController.generateUserName(req, res);

    expect(authService.generateRandomUsername).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Usernames created Successfully",
      usernames: userNames,
    });
  });

  it("should return a 500 status code and an error message if an error occurs", async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = "Error generating usernames";
    authService.generateRandomUsername = jest
      .fn()
      .mockRejectedValue(new Error(errorMessage));

    await authController.generateUserName(req, res);

    expect(authService.generateRandomUsername).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error Creating usernames",
      error: errorMessage,
    });
  });
});
