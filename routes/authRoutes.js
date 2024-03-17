const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const bodyParser = require("body-parser");
const { check } = require("express-validator");

router.post("/googleSignUp", bodyParser.json(), authController.googleSignUp);
router.post("/googleLogin", bodyParser.json(), authController.googleLogin);
router.post("/signUp", bodyParser.json(), authController.signUp);
router.post(
  "/login",
  bodyParser.json(),
  authController.login
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
module.exports = router;
