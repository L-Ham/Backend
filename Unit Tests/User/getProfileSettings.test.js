// const User = require("../../models/user");
// const userController = require("../../controllers/userController");

// describe("getProfileSettings", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should retrieve profile settings for a valid user ID", async () => {
//     const req = { userId: "validUserId" };
//     const res = {
//       json: jest.fn(),
//     };
//     const next = jest.fn();

//     User.findById = jest.fn().mockResolvedValue({
//       profileSettings: new Map([
//         ["displayName", "John Doe"],
//         ["about", "Lorem ipsum"],
//         ["avatarImage", "avatar.jpg"],
//         ["bannerImage", "banner.jpg"],
//         ["NSFW", false],
//         ["allowFollow", true],
//         ["contentVisibility", "public"],
//         ["communitiesVisibility", "private"],
//         ["clearHistory", true],
//       ]),
//       socialLinks: [
//         { platform: "Twitter", url: "https://twitter.com/johndoe" },
//         { platform: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
//       ],
//     });

//     await userController.getProfileSettings(req, res, next);

//     expect(User.findById).toHaveBeenCalledWith("validUserId");
//     expect(res.json).toHaveBeenCalledWith({
//       profileSettings: {
//         displayName: "John Doe",
//         about: "Lorem ipsum",
//         socialLinks: [
//           { platform: "Twitter", url: "https://twitter.com/johndoe" },
//           { platform: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
//         ],
//         avatarImage: "avatar.jpg",
//         bannerImage: "banner.jpg",
//         NSFW: false,
//         allowFollow: true,
//         contentVisibility: "public",
//         communitiesVisibility: "private",
//         clearHistory: true,
//       },
//     });
//   });

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return an error response if user ID is not provided", () => {
//     const req = { userId: null };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     const next = jest.fn();

//     userController.getProfileSettings(req, res, next);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
//   });

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return an error response if user ID is invalid", async () => {
//     const req = { userId: "invalidUserId" };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     const next = jest.fn();

//     User.findById = jest.fn().mockResolvedValue(null);

//     await userController.getProfileSettings(req, res, next);

//     expect(User.findById).toHaveBeenCalledWith("invalidUserId");
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
//   });

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return an error response if there is a server error", async () => {
//     const req = { userId: "validUserId" };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     const next = jest.fn();

//     User.findById = jest.fn().mockRejectedValue(new Error("Database error"));

//     await userController.getProfileSettings(req, res, next);

//     expect(User.findById).toHaveBeenCalledWith("validUserId");
//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
//   });
// });