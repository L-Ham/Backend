// const { validationResult } = require('express-validator');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const User = require('../../models/user');
// const authController = require("../../controllers/authController");

// // Mocking dependencies
// jest.mock('express-validator');
// jest.mock('bcrypt');
// jest.mock('jsonwebtoken');
// jest.mock('../../models/user');


// describe('login', () => {
//   let req;
//   let res;

//   beforeEach(() => {
//     req = {
//       body: {
//         userName: 'testuser',
//         password: 'testpassword',
//       },
//     };
//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should return 400 if there are validation errors', async () => {
//     const errors = {
//       isEmpty: jest.fn().mockReturnValue(false),
//       array: jest.fn().mockReturnValue(['Validation error']),
//     };
//     validationResult.mockReturnValue(errors);

//     await authController.login(req, res);

//     expect(validationResult).toHaveBeenCalledWith(req);
//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith({ errors: ['Validation error'] });
//   });

//   it('should return 400 if user is not found', async () => {
//     User.findOne.mockResolvedValueOnce(null);

//     await authController.login(req, res);

//     expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser' });
//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith({ message: 'Invalid username or password' });
//   });

//   it('should return 400 if password is incorrect', async () => {
//     const user = {
//       password: 'hashedpassword',
//     };
//     User.findOne.mockResolvedValueOnce(user);
//     bcrypt.compare.mockResolvedValueOnce(false);

//     await authController.login(req, res);

//     expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser' });
//     expect(bcrypt.compare).toHaveBeenCalledWith('testpassword', 'hashedpassword');
//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith({ message: 'Invalid username or password' });
//   });

//   it('should return a JWT token if login is successful', async () => {
//     const user = {
//       _id: 'user123',
//       password: 'hashedpassword',
//     };
//     User.findOne.mockResolvedValueOnce(user);
//     bcrypt.compare.mockResolvedValueOnce(true);
//     jwt.sign.mockImplementation((payload, secret, options, callback) => {
//       callback(null, 'jwtToken');
//     });

//     await authController.login(req, res);

//     expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser' });
//     expect(bcrypt.compare).toHaveBeenCalledWith('testpassword', 'hashedpassword');
//     expect(jwt.sign).toHaveBeenCalledWith(
//       { user: { id: 'user123', type: 'normal' } },
//       process.env.JWT_SECRET,
//       { expiresIn: 500000000000 },
//       expect.any(Function)
//     );
//     expect(res.json).toHaveBeenCalledWith({ token: 'jwtToken', message: 'User logged in successfully' });
//   });

//   it('should handle server error', async () => {
//     User.findOne.mockRejectedValueOnce(new Error('Some error message'));

//     await authController.login(req, res);

//     expect(User.findOne).toHaveBeenCalledWith({ userName: 'testuser' });
//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.send).toHaveBeenCalledWith('Server error');
//   });
// });