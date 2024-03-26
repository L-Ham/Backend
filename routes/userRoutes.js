const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");

router.get(
  "/accountSettings",
  bodyParser.json(),
  authenticateToken,
  userController.getAccountSettings
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
router.patch(
  "/followUser",
  bodyParser.json(),
  authenticateToken,
  userController.followUser
);

router.patch(
  "/unfollowUser",
  bodyParser.json(),
  authenticateToken,
  userController.unfollowUser
);

router.get(
  "/usernameAvailability",
  bodyParser.json(),
  userController.checkUserNameAvailability
);
router.patch(
  "/blockUser",
  bodyParser.json(),
  authenticateToken,
  userController.blockUser
);
router.patch(
  "/unblockUser",
  bodyParser.json(),
  authenticateToken,
  userController.unblockUser
);
router.patch(
  "/feedSettings",
  bodyParser.json(),
  authenticateToken,
  userController.editFeedSettings
);
router.get(
  "/feedSettings",
  bodyParser.json(),
  authenticateToken,
  userController.viewFeedSettings
);
router.post(
  "/socialLink",
  bodyParser.json(),
  authenticateToken,
  userController.addSocialLink
);
router.patch(
  "/socialLink",
  bodyParser.json(),
  authenticateToken,
  userController.editSocialLink
);
router.delete(
  "/socialLink",
  bodyParser.json(),
  authenticateToken,
  userController.deleteSocialLink
);
router.patch(
  "/gender",
  bodyParser.json(),
  authenticateToken,
  userController.updateGender
);

router.patch(
  "/muteCommunity",
  bodyParser.json(),
  authenticateToken,
  userController.muteCommunities
);

router.delete(
  "/unmuteCommunity",
  bodyParser.json(),
  authenticateToken,
  userController.unmuteCommunities
);
module.exports = router;
