const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bodyParser = require("body-parser");

router.post(
    "/login",
    [
        check("email", "Please include a valid email").isEmail(),
        check("password", "Password is required").exists()
    ],
    authController.login
);
router.post(
    "/forgotUsername",
    bodyParser.json(),
    authController.forgotUsername
  );
router.get("/profileSettings", authController.getProfileSettings);