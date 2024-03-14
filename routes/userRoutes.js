const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bodyParser = require("body-parser");

router.get(
  "/accountSettings",
  bodyParser.json(),
  userController.getUserSettings
);

router.get(
    "/notificationsSettings",
    bodyParser.json(),
    userController.getNotificationSettings
  );
  router.get("/profileSettings", authController.getProfileSettings);
  router.patch("/profileSettings", authController.editProfileSettings);
  router.get("/safetyAndPrivacySettings", authController.getSafetyAndPrivacySettings);
  
module.exports = router;
