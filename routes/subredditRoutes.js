const express = require("express");
const router = express.Router();
const subredditController = require("../controllers/subredditController");
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");
const { uploadImage } = require("../middleware/multerConfig");

router.post(
  "/createCommunity",
  bodyParser.json(),
  authenticateToken,
  subredditController.createCommunity
);

router.get("/sorting", bodyParser.json(), subredditController.sorting);
router.post(
  "/rule",
  bodyParser.json(),
  authenticateToken,
  subredditController.addRule
);
router.patch(
  "/rule",
  bodyParser.json(),
  authenticateToken,
  subredditController.editRule
);
router.delete(
  "/rule",
  bodyParser.json(),
  authenticateToken,
  subredditController.deleteRule
);
router.post(
  "/TextWidget",
  bodyParser.json(),
  authenticateToken,
  subredditController.addTextWidget
);
router.patch(
  "/TextWidget",
  bodyParser.json(),
  authenticateToken,
  subredditController.editTextWidget
);
router.delete(
  "/TextWidget",
  bodyParser.json(),
  authenticateToken,
  subredditController.deleteTextWidget
);
router.patch(
  "/reorderRules",
  bodyParser.json(),
  authenticateToken,
  subredditController.reorderRules
);
router.patch(
  "/communityDetails",
  bodyParser.json(),
  authenticateToken,
  subredditController.editCommunityDetails
);
router.get(
  "/communityDetails",
  bodyParser.json(),
  authenticateToken,
  subredditController.getCommunityDetails
);
router.get(
  "/rule",
  bodyParser.json(),
  subredditController.getSubRedditRules
);
router.post(
  "/avatarImage",
  bodyParser.json(),
  authenticateToken,
  uploadImage.array("file"),
  subredditController.uploadAvatarImage
);
router.get(
  "/avatarImage",
  bodyParser.json(),
  authenticateToken,
  subredditController.getAvatarImage
);
router.post(
  "/banner",
  bodyParser.json(),
  authenticateToken,
  uploadImage.array("file"),
  subredditController.uploadBannerImage
);
router.get(
  "/banner",
  bodyParser.json(),
  authenticateToken,
  subredditController.getBannerImage
);
router.get(
  "/nameSearch",
  bodyParser.json(),
  authenticateToken,
  subredditController.getSubredditByNames
);

router.get(
  "/rule",
  bodyParser.json(),
  authenticateToken,
  subredditController.getSubredditRules
);
router.get(
  "/widget",
  bodyParser.json(),
  authenticateToken,
  subredditController.getWidget
);

router.get(
  "/popularCommunity",
  bodyParser.json(),
  subredditController.getPopularCommunities
);

router.get(
  "/subredditNameAvailability",
  bodyParser.json(),
  subredditController.checkSubredditNameAvailability
);

router.get(
  "/moderators",
  bodyParser.json(),
  subredditController.getSubredditModerators
);

router.get(
  "/trendingCommunity",
  bodyParser.json(),
  subredditController.getTrendingCommunities
);

router.patch(
  "/user/approve",
  bodyParser.json(),
  authenticateToken,
  subredditController.approveUser
);

router.get(
    "/users/approved",
    bodyParser.json(),
    subredditController.getSubredditMembers
);

router.get(
  "/suggest",
  bodyParser.json(),
  authenticateToken,
  subredditController.suggestSubreddit
);

router.patch(
  "/user/unapprove",
  bodyParser.json(),
  authenticateToken,
  subredditController.UnapproveUser
);
router.patch(
  "/user/ban",
  bodyParser.json(),
  authenticateToken,
  subredditController.banUser
);
router.patch(
  "/user/unban",
  bodyParser.json(),
  authenticateToken,
  subredditController.unbanUser
);

router.get(
  "/users/banned",
  bodyParser.json(),
  authenticateToken,
  subredditController.getBannedUsers
);

router.get(
  "/feed",
  bodyParser.json(),
  authenticateToken,
  subredditController.getSubredditFeed
);

router.get(
  "/reportedPosts",
  bodyParser.json(),
  authenticateToken,
  subredditController.getReportedPosts
);

router.get(
  "/editedPosts",
  bodyParser.json(),
  authenticateToken,
  subredditController.getEditedPosts
)
router.get(
  "/unmoderatedPosts",
  bodyParser.json(),
  authenticateToken,
  subredditController.getUnmoderatedPosts
)
module.exports = router;
