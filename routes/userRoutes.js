const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");
const { uploadImage } = require("../middleware/multerConfig");

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

router.patch(
  "/unfavouriteSubreddit",
  bodyParser.json(),
  authenticateToken,
  userController.removeFavoriteCommunity
);
router.get("/upvotedPosts", bodyParser.json(), userController.getUpvotedPosts);
router.get(
  "/downvotedPosts",
  bodyParser.json(),
  userController.getDownvotedPosts
);
router.get("/savedPosts", bodyParser.json(), userController.getSavedPosts);
router.get("/hiddenPosts", bodyParser.json(), userController.getHiddenPosts);
router.get("/comments", bodyParser.json(), userController.getUserComments);
router.get("/posts", bodyParser.json(), userController.getUserPosts);
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
  "/avatarImage",
  bodyParser.json(),
  authenticateToken,
  uploadImage.array("file"),
  userController.uploadAvatarImage
);
router.get(
  "/avatarImage",
  bodyParser.json(),
  authenticateToken,
  userController.getAvatarImage
);
router.post(
  "/banner",
  bodyParser.json(),
  authenticateToken,
  uploadImage.array("file"),
  userController.uploadBannerImage
);
router.get(
  "/banner",
  bodyParser.json(),
  authenticateToken,
  userController.getBannerImage
);

router.get(
  "/emailSettings",
  bodyParser.json(),
  authenticateToken,
  userController.getEmailSettings
);

router.patch(
  "/emailSettings",
  bodyParser.json(),
  authenticateToken,
  userController.editEmailSettings
);
router.patch(
  "/messagingSettings",
  bodyParser.json(),
  authenticateToken,
  userController.editChatSettings
);
router.get(
  "/messagingSettings",
  bodyParser.json(),
  authenticateToken,
  userController.getChatSettings
);

router.get(
  "/selfInfo",
  bodyParser.json(),
  authenticateToken,
  userController.getUserSelfInfo
);

router.get(
  "/info",
  bodyParser.json(),
  authenticateToken,
  userController.getUserInfo
);

router.get(
  "/community",
  bodyParser.json(),
  authenticateToken,
  userController.getCommunitiesInfo
);

router.get(
  "/notifications",
  bodyParser.json(),
  authenticateToken,
  userController.getNotifications
);
router.get(
  "/history/get",
  bodyParser.json(),
  authenticateToken,
  userController.getHistoryPosts
);

router.get(
  "/searchPosts",
  bodyParser.json(),
  authenticateToken,
  userController.searchPosts
);

router.get(
  "/searchComments",
  bodyParser.json(),
  authenticateToken,
  userController.searchComments
);

router.get(
  "/details",
  bodyParser.json(),
  userController.getUserDetails
);

module.exports = router;
