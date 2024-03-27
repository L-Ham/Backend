// const mongoose = require("mongoose");
// const { ObjectId } = mongoose.Types;
// const User = require("../../models/user");
// const userController = require("../../controllers/userController");

// describe("unfollowUser", () => {
//   it("should successfully unfollow a user when all parameters are valid", async () => {
//     const req = {
//       userId: new ObjectId("660361f20a90d8a02dff19e2"),
//       body: {
//         usernameToUnfollow: "user2",
//       },
//     };

//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     const user = {
//       _id: new ObjectId("660361f20a90d8a02dff19e2"),
//       following: ["user2"],
//       save: jest.fn(),
//     };

//     const userToUnfollow = {
//       _id: new ObjectId("660361f20a90d8a02dff19e3"),
//       followers: ["user1"],
//       save: jest.fn(),
//     };

//     User.findById = jest.fn().mockResolvedValue(user);
//     User.findOne = jest.fn().mockResolvedValue(userToUnfollow);

//     await userController.unfollowUser(req, res);

//     expect(User.findById).toHaveBeenCalledWith(req.userId);
//     expect(User.findOne).toHaveBeenCalledWith({
//       userName: req.body.usernameToUnfollow,
//     });
//     expect(user.following.pull).toHaveBeenCalledWith("user2");
//     expect(userToUnfollow.followers.pull).toHaveBeenCalledWith("user1");
//     expect(user.save).toHaveBeenCalled();
//     expect(userToUnfollow.save).toHaveBeenCalled();
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       message: "User unfollowed successfully",
//     });
//   });
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
// });
