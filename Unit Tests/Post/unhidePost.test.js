

// const { unhidePost } = require("../../controllers/postController");
// const User = require("../../models/user");
// const mongoose = require('mongoose');
// describe("unhidePost", () => {
//   it("should unhide a post successfully when it is already hidden", async () => {
//     const req = {
//         userId: "user123",
//         body: {
//           postId: new mongoose.Types.ObjectId("66017774a46916045eefd332") ,
//         },
//       };
  
//       const res = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn(),
//       };
  
//       const user = {
//         hidePosts: ["post123", "post456"],
//         save: jest.fn(),
//       };

//     User.findById = jest.fn().mockResolvedValue(user);

//     await unhidePost(req, res);

//     expect(User.findById).toHaveBeenCalledWith("user123");
//     expect(user.hidePosts).not.toContain("post123");
//     expect(user.save).toHaveBeenCalled();
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       message: "Post unhidden successfully",
//     });
//   });

//   it("should handle errors when finding user by ID", async () => {
//     const req = {
//       userId: "user123",
//       body: {
//         postId: "post123",
//       },
//     };

//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     User.findById = jest.fn().mockRejectedValue(new Error("User not found"));

//     await unhidePost(req, res);

//     expect(User.findById).toHaveBeenCalledWith("user123");
//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({ message: "Error unhidding post" });
//   });

//   it("should not unhide a post when it is already not hidden", async () => {
//     const req = {
//       userId: "user123",
//       body: {
//         postId: "post123",
//       },
//     };

//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     const user = {
//       hidePosts: [],
//       save: jest.fn(),
//     };

//     User.findById = jest.fn().mockResolvedValue(user);

//     await unhidePost(req, res);

//     expect(User.findById).toHaveBeenCalledWith("user123");
//     expect(user.hidePosts).not.toContain("post123");
//     expect(user.save).not.toHaveBeenCalled();
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({
//       message: "This post is not hidden in your profile",
//     });
//   });
// });
