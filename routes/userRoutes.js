const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");
const { uploadImage  } = require("../middleware/multerConfig");


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
  userController.muteCommunity
);

router.delete(
  "/unmuteCommunity",
  bodyParser.json(),
  authenticateToken,
  userController.unmuteCommunity
);

router.patch(
  "/joinCommunity",
  bodyParser.json(),
  authenticateToken,
  userController.joinCommunity
);

router.delete(
  "/unjoinCommunity",
  bodyParser.json(),
  authenticateToken,
  userController.unjoinCommunity
);

router.patch(
  "/favouriteSubreddit",
  bodyParser.json(),
  authenticateToken,
  userController.addFavoriteCommunity
);

router.delete(
  "/unfavouriteSubreddit",
  bodyParser.json(),
  authenticateToken,
  userController.removeFavoriteCommunity
);
router.get(
  "/upvotedPosts",
  bodyParser.json(),
  authenticateToken,
  userController.getUpvotedPosts
);
router.get(
  "/downvotedPosts",
  bodyParser.json(),
  authenticateToken,
  userController.getDownvotedPosts
);
router.get(
  "/getAllBlockedUsers",
  bodyParser.json(),
  authenticateToken,
  userController.getAllBlockedUsers
);
router.patch(
  "/editUserLocation",
  bodyParser.json(),
  authenticateToken,
  userController.editUserLocation
);
router.get(
  "/getUserLocation",
  bodyParser.json(),
  authenticateToken,
  userController.getUserLocation
);
router.get(
  "/searchUsernames",
  bodyParser.json(),
  authenticateToken,
  userController.searchUsernames
);
router.post(
  "/uploadAvatarImage",
  bodyParser.json(),
  authenticateToken,
  uploadImage.array('file'),
  userController.uploadAvatarImage
);

module.exports = router;
