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
  "/logout",
  authenticateToken,
  bodyParser.json(),
  authController.logout
);
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
  authController.updatePassword
);
router.patch(
  "/email",
  bodyParser.json(),
  authenticateToken,
  authController.updateEmail
);
router.patch(
  "/googleDisconnect",
  bodyParser.json(),
  authenticateToken,
  authController.googleDisconnect
);
router.patch(
  "/googleConnect",
  bodyParser.json(),
  authenticateToken,
  googleAuth,
  authController.googleConnect
);
router.delete(
  "/deleteAccount",
  bodyParser.json(),
  authenticateToken,
  authController.deleteAccount
);
router.patch(
  "/changePassword",
  bodyParser.json(),
  authenticateToken,
  authController.changePassword
);

module.exports = router;
