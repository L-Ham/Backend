// const mongoose = require("mongoose");
// const { ObjectId } = mongoose.Types;
// const User = require("../../models/user");
// const userController = require("../../controllers/userController");
// describe("editNotificationSettings", () => {
//   it("should update all notification settings when given a valid user ID and valid notification settings data", async () => {
//     const oid = new ObjectId("660361f20a90d8a02dff19e2");
//     const req = {
//       userId: oid,
//       body: {
//         inboxMessage: true,
//         chatMessages: true,
//         chatRequest: true,
//         mentions: true,
//         comments: true,
//         upvotesToPosts: true,
//         upvotesToComments: true,
//         repliesToComments: true,
//         newFollowers: true,
//         modNotifications: true,
//       },
//     };

//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     const user1 = {
//       _id: req.userId,
//       notificationSettings: new Map([
//         ["inboxMessage", false],
//         ["chatMessages", false],
//         // ... rest of your settings
//       ]),
//       save: jest.fn(),
//     };
//     user1.notificationSettings.set = jest.fn((key, value) => {
//       user1.notificationSettings.set(key, value);
//     });

//     User.findById = jest.fn().mockResolvedValue(user1);
//     await userController.editNotificationSettings(req, res);
//     expect(User.findById).toHaveBeenCalledWith(req.userId);
//     expect(user1.save).toHaveBeenCalled();
//     Object.keys(req.body).forEach((key) => {
//       expect(user1.notificationSettings.set).toHaveBeenCalledWith(
//         key,
//         req.body[key]
//       );
//     });
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       message: "User Notification settings updated successfully",
//       user: expect.any(Object),
//     });
//   });
// });
