const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const bodyParser = require("body-parser");
const { check } = require("express-validator");
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  bodyParser.json(),
  authController.login
);
router.post(
  "/forgotUsername",
  bodyParser.json(),
  authController.forgetUsername
);

module.exports = router;