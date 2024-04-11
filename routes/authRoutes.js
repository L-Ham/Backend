const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");
const { check } = require("express-validator");
const { auth } = require("google-auth-library");
const googleAuth = require("../middleware/googleAuth");

router.post(
  "/googleSignUp",
  bodyParser.json(),
  googleAuth,
  authController.googleSignUp
);
router.post(
  "/googleLogin",
  bodyParser.json(),
  googleAuth,
  authController.googleLogin
);
router.post("/signUp", bodyParser.json(), authController.signUp);
router.post("/login", bodyParser.json(), authController.login);
router.post(
  "/forgotUsername",
  bodyParser.json(),
  authController.forgetUsername
);
router.post(
  "/forgotPassword",
  bodyParser.json(),
  authController.forgetPassword
);
router.get(
  "/generateUsernames",
  bodyParser.json(),
  authController.generateUserName
);
router.patch(
  "/updatePassword",
  bodyParser.json(),
  authenticateToken,
  authController.updatePassword
);
module.exports = router;
