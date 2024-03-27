// const { validationResult } = require("express-validator");
// const bcrypt = require("bcryptjs"); // Assuming bcrypt is imported in the controller
// const jwt = require("jsonwebtoken"); // Assuming jwt is imported in the controller
// const User = require("../../models/user");
// const authController = require("../../controllers/authController");

// describe("login", () => {
//   it("should login successfully with valid credentials", async () => {
//     const req = {
//       body: {
//         userName: "john_doe",
//         password: "password123",
//       },
//     };
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     const mockUser = {
//       _id: "user_id",
//       userName: "john_doe",
//       password: "hashed_password",
//     };

//     User.findOne = jest.fn().mockResolvedValue(mockUser);

//     bcrypt.compare = jest.fn().mockResolvedValue(true);

//     jwt.sign = jest.fn().mockReturnValue("mocked_token");

//     await authController.login(req, res);
//     //expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//         token: "mocked_token",
//         message: "User logged in successfully",
//     });
//   });
// });
