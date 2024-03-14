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
router.get("/profileSettings", userController.getProfileSettings);
router.patch("/profileSettings", userController.editProfileSettings);
router.get(
  "/safetyAndPrivacySettings",
  userController.getSafetyAndPrivacySettings
);
router.patch(
  "/safetyAndPrivacySettings",
  userController.editSafetyAndPrivacySettings
);

router.patch(
    "/notificationsSettings",
    bodyParser.json(),
    userController.editNotificationSettings
);

router.post(
  "/createCommunity",
  bodyParser.json(),
  userController.createCommunity
);

module.exports = router;
