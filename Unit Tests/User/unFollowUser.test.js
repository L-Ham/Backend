const User = require("../../models/user");
const userController = require("../../controllers/userController");

describe("unfollowUser", () => {
  //   it("should return an error message when user to unfollow is not found", async () => {
  //     const req = {
  //       userId: "validUserId",
  //       body: {
  //         usernameToUnfollow: "nonExistingUser",
  //       },
  //     };

  //     const res = {
  //       status: jest.fn().mockReturnThis(),
  //       json: jest.fn(),
  //     };

  //     User.findById = jest.fn().mockResolvedValue({});
  //     User.findOne = jest.fn().mockResolvedValue(null); // Mock the user to unfollow as not found

  //     await userController.unfollowUser(req, res);

  //     expect(User.findById).toHaveBeenCalledWith("validUserId");
  //     expect(User.findOne).toHaveBeenCalledWith({
  //       userName: req.body.usernameToUnfollow,
  //     });
  //     expect(res.status).toHaveBeenCalledWith(404);
  //     expect(res.json).toHaveBeenCalledWith({
  //       message: "User to unfollow not found",
  //     });
  //   });

  it("should return an error message when user is not followed", async () => {
    const req = {
      userId: "validUserId",
      body: {
        usernameToUnfollow: "userToUnfollow",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockResolvedValue({
      following: [],
      save: jest.fn(),
    });

    User.findOne = jest.fn().mockResolvedValue({
      _id: "userToUnfollowId",
    });

    await userController.unfollowUser(req, res);

    expect(User.findById).toHaveBeenCalledWith("validUserId");
    expect(User.findOne).toHaveBeenCalledWith({ userName: "userToUnfollow" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "User not followed" });
  });

  //   it("should unfollow the user successfully", async () => {
  //     const req = {
  //       userId: "validUserId",
  //       body: {
  //         usernameToUnfollow: "userToUnfollow",
  //       },
  //     };

  //     const res = {
  //       status: jest.fn().mockReturnThis(),
  //       json: jest.fn(),
  //     };

  //     const user = {
  //       _id: req.userId,
  //       following: {
  //         pull: jest.fn(),
  //       },
  //       save: jest.fn(),
  //     };

  //     const userToUnfollow = {
  //       _id: "userToUnfollowId",
  //       followers: {
  //         pull: jest.fn(),
  //       },
  //       save: jest.fn(),
  //     };

  //     User.findById = jest.fn().mockResolvedValue(user);
  //     User.findOne = jest.fn().mockResolvedValue(userToUnfollow);

  //     await userController.unfollowUser(req, res);

  //     expect(User.findById).toHaveBeenCalledWith("validUserId");
  //     expect(User.findOne).toHaveBeenCalledWith({ userName: "userToUnfollow" });
  //     expect(user.following.pull).toHaveBeenCalledWith("userToUnfollowId");
  //     expect(userToUnfollow.followers.pull).toHaveBeenCalledWith("validUserId");
  //     expect(user.save).toHaveBeenCalled();
  //     expect(userToUnfollow.save).toHaveBeenCalled();
  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({
  //       message: "User unfollowed successfully",
  //     });
  //   });

  it("should return an error message when an error occurs", async () => {
    const req = {
      userId: "validUserId",
      body: {
        usernameToUnfollow: "userToUnfollow",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findById = jest.fn().mockRejectedValue(new Error("Database error"));

    await userController.unfollowUser(req, res);

    expect(User.findById).toHaveBeenCalledWith("validUserId");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to unfollow user",
      error: "Database error",
    });
  });
});
