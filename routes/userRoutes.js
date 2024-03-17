const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");

router.get(
  "/accountSettings",
  bodyParser.json(),
  authenticateToken,
  userController.getUserSettings
);

router.get(
  "/notificationsSettings",
  bodyParser.json(),
  authenticateToken,
  userController.getNotificationSettings
);
router.get(
  "/profileSettings",
  bodyParser.json(),
  authenticateToken,
  userController.getProfileSettings
);
router.patch(
  "/profileSettings",
  bodyParser.json(),
  authenticateToken,
  userController.editProfileSettings
);
router.get(
  "/safetyAndPrivacySettings",
  bodyParser.json(),
  authenticateToken,
  userController.getSafetyAndPrivacySettings
);
router.patch(
  "/safetyAndPrivacySettings",
  bodyParser.json(),
  authenticateToken,
  userController.editSafetyAndPrivacySettings
);

router.patch(
  "/notificationsSettings",
  bodyParser.json(),
  authenticateToken,
  userController.editNotificationSettings
);

module.exports = router;
