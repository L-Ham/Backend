const User = require("../models/user");
const { updateOne } = require("../models/socialLink");
const SubReddit = require("../models/subReddit");
const Post = require("../models/post");
const UserUploadModel = require("../models/userUploads");
const jwt = require("jsonwebtoken");
const UserUpload = require("../controllers/userUploadsController");
const UserServices = require("../services/userServices");
const PostServices = require("../services/postServices");
const { get } = require("http");

const getNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ notificationSettings: user.notificationSettings });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving notification settings", error: err });
  }
};
const getProfileSettings = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).populate("socialLinks");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profileSettings = {
      displayName: user.profileSettings.get("displayName"),
      about: user.profileSettings.get("about"),
      socialLinks: user.socialLinks,
      avatarImage: user.profileSettings.get("avatarImage"),
      bannerImage: user.profileSettings.get("bannerImage"),
      NSFW: user.profileSettings.get("NSFW"),
      allowFollow: user.profileSettings.get("allowFollow"),
      contentVisibility: user.profileSettings.get("contentVisibility"),
      communitiesVisibility: user.profileSettings.get("communitiesVisibility"),
      clearHistory: user.profileSettings.get("clearHistory"),
    };

    res.json({ profileSettings });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const editProfileSettings = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profileSettings.set("displayName", req.body.displayName);
    user.profileSettings.set("about", req.body.about);
    user.profileSettings.set("avatarImage", req.body.avatarImage);
    user.profileSettings.set("bannerImage", req.body.bannerImage);
    user.profileSettings.set("NSFW", req.body.NSFW);
    user.profileSettings.set("allowFollow", req.body.allowFollow);
    user.profileSettings.set("contentVisibility", req.body.contentVisibility);
    user.profileSettings.set(
      "communitiesVisibility",
      req.body.communitiesVisibility
    );
    user.profileSettings.set("clearHistory", req.body.clearHistory);

    const updatedUser = await user.save();

    res.json({
      message: "User profile settings updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating profile settings", error: err });
  }
};

/**
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - Retrieves the account settings for a user..
 * @returns {Promise<void>} - A promise that resolves when the account settings are retrieved.
 */
const getAccountSettings = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accountSettings = {
      email: user.email,
      gender: user.gender,
      connectedToGoogle: user.signupGoogle,
    };

    res.json({ accountSettings });
  } catch (err) {
    res.status(500).json({ message: "Error Retreiving user", error: err });
  }
};

/**
 * Retrieves the safety and privacy settings for a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The safety and privacy settings for the user.
 */
const getSafetyAndPrivacySettings = async (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(404).json({ message: "User Id not provided" });
  }

  try {
    const user = await User.findById(userId).select(
      "blockUsers muteCommunities"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const safetyAndPrivacySettings = {
      blockUsers: user.blockUsers.map((blockedUser) => ({
        blockedUserName: blockedUser.blockedUserName,
        blockedUserAvatar: blockedUser.blockedUserAvatar,
        blockedAt: blockedUser.blockedAt,
      })),
      muteCommunities: user.muteCommunities.map((mutedCommunity) => ({
        mutedCommunityName: mutedCommunity.mutedCommunityName,
        mutedCommunityAvatar: mutedCommunity.mutedCommunityAvatar,
        mutedAt: mutedCommunity.mutedAt,
      })),
    };

    return res.json(safetyAndPrivacySettings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user settings" });
  }
};

//REDUNDANT
const editSafetyAndPrivacySettings = (req, res, next) => {
  const userId = req.userId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.blockUsers = req.body.blockUsers;
      user.muteCommunities = req.body.muteCommunities;
      user
        .save()
        .then((updatedUser) => {
          res.json({
            message: "User safety and privacy settings updated successfully",
            user: updatedUser,
          });
        })
        .catch((err) => {
          res
            .status(500)
            .json({ message: "Failed to update safety and privacy settings " });
        });
    })
    .catch((err) => {
      res.status(500).json({ message: "Server error" });
    });
};
/**
 * Updates the notification settings for a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.userId - The ID of the user.
 * @param {Object} req.body - The request body containing the updated notification settings.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the notification settings are updated.
 * @throws {Error} - If there is an error updating the notification settings.
 */
const editNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.userId;
    // const user = await User.findById(userId).select("notificationSettings");
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.notificationSettings.set("inboxMessage", req.body.inboxMessage);
    user.notificationSettings.set("chatMessages", req.body.chatMessages);
    user.notificationSettings.set("chatRequest", req.body.chatRequest);
    user.notificationSettings.set("mentions", req.body.mentions);
    user.notificationSettings.set("comments", req.body.comments);
    user.notificationSettings.set("upvotesToPosts", req.body.upvotesToPosts);
    user.notificationSettings.set(
      "upvotesToComments",
      req.body.upvotesToComments
    );
    user.notificationSettings.set(
      "repliesToComments",
      req.body.repliesToComments
    );
    user.notificationSettings.set("newFollowers", req.body.newFollowers);
    user.notificationSettings.set(
      "modNotifications",
      req.body.modNotifications
    );
    await user.save();
    res.status(200).json({
      message: "User Notification settings updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating notification settings" });
  }
};

/**
 * Follows a user.
 *
 * @param {Object} req - The request object. It should have a `userId` property (the ID of the user who wants to follow another user) and a `body` property with a `usernameToFollow` property (the username of the user to be followed).
 * @param {Object} res - The response object. This function will set the status and JSON body of the response.
 * @param {Function} next - The next middleware function. This function is not used in the current implementation, but is included for potential future use.
 * @returns {Promise<void>} - A promise that resolves when the user is followed successfully. The promise does not resolve to any value.
 * @throws {Error} - If there is an error while following the user, an error is thrown and the response status is set to 500 with a JSON body containing the error message.
 */
const followUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const usernameToFollow = req.body.usernameToFollow;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userToFollow = await User.findOne({ userName: usernameToFollow });
    if (!userToFollow) {
      return res.status(404).json({ message: "User to follow not found" });
    }
    if (userToFollow._id.equals(userId)) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }
    if (
      user.blockUsers.some((blockedUser) =>
        blockedUser.blockedUserId.equals(userToFollow._id)
      )
    ) {
      return res.status(400).json({ message: "You have blocked this user" });
    }
    console.log(
      userToFollow.blockUsers.some(
        (blockUser) => blockUser.blockedUserId == user._id
      )
    );
    if (
      userToFollow.blockUsers.some((blockUser) =>
        blockUser.blockedUserId.equals(user._id)
      )
    ) {
      return res
        .status(400)
        .json({ message: "You have been blocked by this user" });
    }
    if (user.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: "User already followed" });
    }
    user.following.push(userToFollow._id);
    userToFollow.followers.push(userId);
    await Promise.all([user.save(), userToFollow.save()]);
    res.status(200).json({
      message: "User followed successfully",
      user: userToFollow,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to follow user", error: err });
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const usernameToUnfollow = req.body.usernameToUnfollow;

    const user = await User.findById(userId);
    const userToUnfollow = await User.findOne({ userName: usernameToUnfollow });
    if (!userToUnfollow) {
      return res.status(500).json({ message: "User to unfollow not found" });
    }
    if (userToUnfollow._id.equals(userId)) {
      return res.status(400).json({ message: "You can't unfollow yourself" });
    }
    if (!user.following.includes(userToUnfollow._id)) {
      return res.status(500).json({ message: "User not followed" });
    }

    user.following.pull(userToUnfollow._id);
    userToUnfollow.followers.pull(userId);

    await user.save();
    await userToUnfollow.save();

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to unfollow user",
      error: err.message,
    });
  }
};

const checkUserNameAvailability = async (req, res, next) => {
  try {
    const userName = req.query.username;

    if (!userName) {
      return res.status(400).json({ message: "Username is empty" });
    }

    const user = await User.findOne({ userName: userName });

    if (user) {
      return res.status(409).json({ message: "Username already taken" });
    }
    res.json({ message: "Username available" });
  } catch (err) {
    if (res.status) {
      res.status(500).json({ message: "Server error" });
    } else {
      next(err);
    }
  }
};

const blockUser = async (req, res, next) => {
  try {
    const blockedUserName = req.body.usernameToBlock;
    const userId = req.userId;
    const userToBlock = await User.findOne({ userName: blockedUserName });

    if (!userToBlock) {
      return res.status(404).json({ message: "User not found" });
    }
    if (userToBlock._id.equals(userId)) {
      return res.status(400).json({ message: "User cannot block themselves" });
    }
    userToBlock.following.pull(userId);
    await userToBlock.save();
    const user = await User.findById(userId);

    if (
      user.blockUsers.some((blockedUser) =>
        blockedUser.blockedUserId.equals(userToBlock._id)
      )
    ) {
      return res.status(409).json({ message: "User already blocked" });
    }
    user.blockUsers.push({
      blockedUserId: userToBlock._id,
      blockedUserName: userToBlock.userName,
      blockedUserAvatar: userToBlock.avatarImage,
      blockedAt: new Date(),
    });
    user.followers.pull(userToBlock._id);
    const updatedUser = await user.save();

    res.json({ message: "User blocked", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const blockedUserName = req.body.UserNameToUnblock;
    const userId = req.userId;
    const userToUnblock = await User.findOne({ userName: blockedUserName });

    if (!userToUnblock) {
      return res.status(404).json({ message: "User not found" });
    }
    if (userToUnblock._id.equals(userId)) {
      return res
        .status(400)
        .json({ message: "User cannot unblock themselves" });
    }
    const user = await User.findById(userId);

    if (
      !user.blockUsers.some((blockedUser) =>
        blockedUser.blockedUserId.equals(userToUnblock._id)
      )
    ) {
      return res.status(409).json({ message: "User is not blocked" });
    }
    user.blockUsers = user.blockUsers.filter(
      (blockedUser) => !blockedUser.blockedUserId.equals(userToUnblock._id)
    );
    const updatedUser = await user.save();

    res.json({ message: "User unblocked", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

async function editFeedSettings(req, res, next) {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.feedSettings.set("showNSFW", req.body.showNSFW);
    user.feedSettings.set("blurNSFW", req.body.blurNSFW);
    user.feedSettings.set(
      "enableHomeFeedRecommendations",
      req.body.enableHomeFeedRecommendations
    );
    user.feedSettings.set("autoplayMedia", req.body.autoplayMedia);
    user.feedSettings.set("reduceAnimations", req.body.reduceAnimations);
    user.feedSettings.set("communityThemes", req.body.communityThemes);
    user.feedSettings.set(
      "communityContentSort",
      req.body.communityContentSort
    );
    user.feedSettings.set(
      "rememberPerCommunity",
      req.body.rememberPerCommunity
    );
    user.feedSettings.set("globalContentView", req.body.globalContentView);
    user.feedSettings.set("openPostsInNewTab", req.body.openPostsInNewTab);
    user.feedSettings.set("defaultToMarkdown", req.body.defaultToMarkdown);

    const updatedUser = await user.save();
    res.json({
      message: "User Feed settings updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function viewFeedSettings(req, res, next) {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const feedSettings = {
      showNSFW: user.feedSettings.get("showNSFW"),
      blurNSFW: user.feedSettings.get("blurNSFW"),
      enableHomeFeedRecommendations: user.feedSettings.get(
        "enableHomeFeedRecommendations"
      ),
      autoplayMedia: user.feedSettings.get("autoplayMedia"),
      reduceAnimations: user.feedSettings.get("reduceAnimations"),
      communityThemes: user.feedSettings.get("communityThemes"),
      communityContentSort: user.feedSettings.get("communityContentSort"),
      rememberPerCommunity: user.feedSettings.get("rememberPerCommunity"),
      globalContentView: user.feedSettings.get("globalContentView"),
      openPostsInNewTab: user.feedSettings.get("openPostsInNewTab"),
      defaultToMarkdown: user.feedSettings.get("defaultToMarkdown"),
    };

    res.json({ feedSettings });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
async function addSocialLink(req, res, next) {
  try {
    const userId = req.userId;
    const { linkOrUsername, appName, displayText } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.socialLinks.length >= 5) {
      return res
        .status(400)
        .json({ message: "Maximum number of social links reached" });
    }

    user.socialLinks.push({ linkOrUsername, appName, displayText });

    const updatedUser = await user.save();
    res.json({ message: "Social link added successfully", user: updatedUser });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding social link to user", error: err });
  }
}

const editSocialLink = async (req, res, next) => {
  const userId = req.userId;
  const { linkId, linkOrUsername, appName, displayText } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const socialLinkToUpdate = user.socialLinks.find(
      (link) => link._id.toString() === linkId
    );

    if (!socialLinkToUpdate) {
      return res.status(404).json({ message: "Social link not found" });
    }

    socialLinkToUpdate.linkOrUsername = linkOrUsername;
    socialLinkToUpdate.appName = appName;
    socialLinkToUpdate.displayText = displayText;

    const updatedUser = await user.save();

    res.json({
      message: "Social link updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating social link for user", error: err });
  }
};

const deleteSocialLink = async (req, res, next) => {
  const userId = req.userId;
  const linkId = req.body.socialLinkId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const socialLinkToDelete = user.socialLinks.find(
      (link) => link._id.toString() === linkId
    );
    if (!socialLinkToDelete) {
      return res.status(404).json({ message: "Social link not found" });
    }

    user.socialLinks.pull(socialLinkToDelete);
    const updatedUser = await user.save();

    res.json({
      message: "Social link deleted successfully",
      user: updatedUser,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting social link from user", error: err });
  }
};

const updateGender = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.gender === req.body.gender) {
      return res
        .status(400)
        .json({ message: "Gender is already set to this value" });
    }
    if (
      req.body.gender === "Female" ||
      req.body.gender === "Male" ||
      req.body.gender === "" ||
      req.body.gender === "I prefer not to say"
    ) {
      user.gender = req.body.gender;
      const updatedUser = await user.save();

      res.status(200).json({
        message: "User gender updated successfully",
        user: updatedUser,
      });
    } else {
      res.status(400).json({
        message:
          "Gender format should be Female/Male/I prefer not to say/Empty String",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to update User Gender",
      error: err,
    });
  }
};

const muteCommunity = async (req, res, next) => {
  try {
    const userId = req.userId;
    const communityName = req.body.subRedditName;

    const user = await User.findById(userId);
    const community = await SubReddit.findOne({ name: communityName });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    if (!user.communities.includes(community._id)) {
      return res
        .status(400)
        .json({ message: "User is not a member of this community" });
    }
    if (
      user.muteCommunities.some((muteCommunity) =>
        muteCommunity.mutedCommunityId.equals(community._id)
      )
    ) {
      return res.status(400).json({ message: "Community already muted" });
    }

    user.muteCommunities.push({
      mutedCommunityId: community._id,
      mutedCommunityName: community.name,
      mutedCommunityAvatar: community.appearance.avatarImage,
      mutedAt: new Date(),
    });
    await user.save();

    res.json({
      message: "Community muted successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error muting community for user",
      error: err,
    });
  }
};

const unmuteCommunity = async (req, res, next) => {
  try {
    const userId = req.userId;
    const communityName = req.body.subRedditName;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const community = await SubReddit.findOne({ name: communityName });
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const isMuted = user.muteCommunities.some((muteCommunity) =>
      muteCommunity.mutedCommunityId.equals(community._id)
    );
    if (!isMuted) {
      return res
        .status(404)
        .json({ message: "This subReddit is not muted for you" });
    }

    //user.muteCommunities.pull(communityId);
    user.muteCommunities = user.muteCommunities.filter(
      (muteCommunity) => !muteCommunity.mutedCommunityId.equals(community._id)
    );
    await user.save();

    res.json({
      message: "Community unmuted successfully",
      user,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error unmuting community for user", error: err });
  }
};
const joinCommunity = async (req, res, next) => {
  try {
    const userId = req.userId;
    const communityId = req.body.subRedditId;

    // Find user and community
    const user = await User.findById(userId);
    const community = await SubReddit.findById(communityId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Handle join logic based on community privacy
    if (community.privacy === "private" || community.privacy === "Private") {
      if (community.pendingMembers.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User already requested to join community" });
      }
      community.pendingMembers.push(userId);
    } else {
      // Public, Restricted
      if (community.members.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User already in this community" });
      }
      community.members.push(userId);
      user.communities.push(communityId);
    }
    await community.save();
    if (community.privacy !== "private" && community.privacy !== "Private") {
      await user.save();
    }
    if (community.privacy === "private" || community.privacy === "Private") {
      res.json({
        message: "User requested to join community",
        community,
      });
    } else {
      res.json({
        message: "User joined community",
        community,
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Error joining community", error: err });
  }
};
const unjoinCommunity = async (req, res) => {
  try {
    const userId = req.userId;
    const communityId = req.body.subRedditId;
    const user = await User.findById(userId);
    const community = await SubReddit.findById(communityId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Unjoin logic based on community privacy
    if (community.privacy === "private" || community.privacy === "Private") {
      if (
        !community.pendingMembers.includes(userId) &&
        !community.members.includes(userId)
      ) {
        return res.status(400).json({
          message: "User is not pending or a member of this community",
        });
      }
      community.pendingMembers.pull(userId);
      community.members.pull(userId);
    } else {
      // Public, Restricted
      if (!community.members.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User is not a member of this community" });
      }
      community.members.pull(userId); // Remove directly
    }

    // Save community and user
    await community.save();
    user.communities.pull(communityId);
    await user.save();

    res.json({
      message: "User unjoined community",
      community,
    });
  } catch (err) {
    res.status(500).json({ message: "Error unjoining community", error: err });
  }
};

const addFavoriteCommunity = async (req, res) => {
  try {
    const userId = req.userId;
    const communityId = req.body.subRedditId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const community = await SubReddit.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    if (!user.communities.includes(communityId)) {
      return res
        .status(400)
        .json({ message: "User is not a member of this community" });
    }
    if (user.favoriteCommunities.includes(communityId)) {
      return res
        .status(400)
        .json({ message: "Community already favorited by user" });
    }

    user.favoriteCommunities.push(communityId);
    await user.save();
    res.json({
      message: "Community favorited successfully",
      community,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error favoriting community", error: err.message });
  }
};

const removeFavoriteCommunity = async (req, res) => {
  try {
    const userId = req.userId;
    const communityId = req.body.subRedditId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const community = await SubReddit.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    if (!user.communities.includes(communityId)) {
      return res
        .status(400)
        .json({ message: "User is not a member of this community" });
    }
    if (!user.favoriteCommunities.includes(communityId)) {
      return res
        .status(400)
        .json({ message: "Community not favorited by user" });
    }

    user.favoriteCommunities.pull(communityId);
    await user.save();
    res.json({
      message: "Community unfavorited successfully",
      community,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error unfavoriting community", error: err });
  }
};
const getUpvotedPosts = async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const query = Post.find({ _id: { $in: user.upvotedPosts } });
    const result = await UserServices.paginateResults(query, page, limit);
    if (result.slicedArray.length == 0) {
      return res.status(500).json({ message: "The retrieved array is empty" });
    }
    const postsWithVoteStatus = await Promise.all(
      result.slicedArray.map(async (post) => {
        const isUpvoted = post.upvotedUsers.includes(userId);
        const isDownvoted = post.downvotedUsers.includes(userId);
        const subreddit = await SubReddit.findById(post.subReddit);
        let imageUrls, videoUrls;
        if (post.type === "image") {
          imageUrls = await PostServices.getImagesUrls(post.images);
        }
        if (post.type === "video") {
          videoUrls = await PostServices.getVideosUrls(post.videos);
        }
        const postObj = {
          ...post._doc,
          subredditName: subreddit ? subreddit.name : null,
          isUpvoted,
          isDownvoted,
          imageUrls,
          videoUrls,
        };
        delete postObj.images;
        delete postObj.videos;
        delete postObj.upvotedUsers;
        delete postObj.downvotedUsers;
        delete postObj.comments;
        delete postObj.spamCount;
        delete postObj.spammedBy;
        return postObj;
      })
    );
    return res.status(200).json({
      message: "Retrieved User's Upvoted Posts",
      upvotedPosts: postsWithVoteStatus,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error Getting Posts Upvoted by User",
      error: err.message,
    });
  }
};
const getDownvotedPosts = async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const query = Post.find({ _id: { $in: user.downvotedPosts } });
    const result = await UserServices.paginateResults(query, page, limit);
    if (result.slicedArray.length == 0) {
      return res.status(500).json({ message: "The retrieved array is empty" });
    }
    const postsWithVoteStatus = await Promise.all(
      result.slicedArray.map(async (post) => {
        const isUpvoted = post.upvotedUsers.includes(userId);
        const isDownvoted = post.downvotedUsers.includes(userId);
        const subreddit = await SubReddit.findById(post.subReddit);
        let imageUrls, videoUrls;
        if (post.type === "image") {
          imageUrls = await PostServices.getImagesUrls(post.images);
        }
        if (post.type === "video") {
          videoUrls = await PostServices.getVideosUrls(post.videos);
        }
        const postObj = {
          ...post._doc,
          subredditName: subreddit ? subreddit.name : null,
          isUpvoted,
          isDownvoted,
          imageUrls,
          videoUrls,
        };
        delete postObj.images;
        delete postObj.videos;
        delete postObj.upvotedUsers;
        delete postObj.downvotedUsers;
        delete postObj.comments;
        delete postObj.spamCount;
        delete postObj.spammedBy;
        return postObj;
      })
    );
    return res.status(200).json({
      message: "Retrieved User's Downvoted Posts",
      downvotedPosts: postsWithVoteStatus,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error Getting Posts Downvoted by User",
      error: err.message,
    });
  }
};

const getSavedPosts = async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const query = Post.find({ _id: { $in: user.savedPosts } });
    const result = await UserServices.paginateResults(query, page, limit);
    if (result.slicedArray.length == 0) {
      return res.status(500).json({ message: "The retrieved array is empty" });
    }
    const postsWithVoteStatus = await Promise.all(
      result.slicedArray.map(async (post) => {
        const isUpvoted = post.upvotedUsers.includes(userId);
        const isDownvoted = post.downvotedUsers.includes(userId);
        const subreddit = await SubReddit.findById(post.subReddit);
        let imageUrls, videoUrls;
        if (post.type === "image") {
          imageUrls = await PostServices.getImagesUrls(post.images);
        }
        if (post.type === "video") {
          videoUrls = await PostServices.getVideosUrls(post.videos);
        }
        const postObj = {
          ...post._doc,
          subredditName: subreddit ? subreddit.name : null,
          isUpvoted,
          isDownvoted,
          imageUrls,
          videoUrls,
        };
        delete postObj.images;
        delete postObj.videos;
        delete postObj.upvotedUsers;
        delete postObj.downvotedUsers;
        delete postObj.comments;
        delete postObj.spamCount;
        delete postObj.spammedBy;
        return postObj;
      })
    );
    return res.status(200).json({
      message: "Retrieved User's Saved Posts",
      savedPosts: postsWithVoteStatus,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error Getting Posts Saved by User",
      error: err.message,
    });
  }
};

const getHiddenPosts = async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const query = Post.find({ _id: { $in: user.hidePosts } });
    const result = await UserServices.paginateResults(query, page, limit);
    if (result.slicedArray.length == 0) {
      return res.status(500).json({ message: "The retrieved array is empty" });
    }
    const postsWithVoteStatus = await Promise.all(
      result.slicedArray.map(async (post) => {
        const isUpvoted = post.upvotedUsers.includes(userId);
        const isDownvoted = post.downvotedUsers.includes(userId);
        const subreddit = await SubReddit.findById(post.subReddit);
        let imageUrls, videoUrls;
        if (post.type === "image") {
          imageUrls = await PostServices.getImagesUrls(post.images);
        }
        if (post.type === "video") {
          videoUrls = await PostServices.getVideosUrls(post.videos);
        }
        const postObj = {
          ...post._doc,
          subredditName: subreddit ? subreddit.name : null,
          isUpvoted,
          isDownvoted,
          imageUrls,
          videoUrls,
        };
        delete postObj.images;
        delete postObj.videos;
        delete postObj.upvotedUsers;
        delete postObj.downvotedUsers;
        delete postObj.comments;
        delete postObj.spamCount;
        delete postObj.spammedBy;
        return postObj;
      })
    );
    return res.status(200).json({
      message: "Retrieved User's Hidden Posts",
      hiddenPosts: postsWithVoteStatus,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error Getting Posts Hidden by User",
      error: err.message,
    });
  }
};
const getAllBlockedUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate({
      path: "blockUsers",
      select: "_id blockedUserName blockedUserAvatar",
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const blockedUsers = user.blockUsers.map((blockedUser) => ({
      id: blockedUser._id,
      userName: blockedUser.blockedUserName,
      avatarImage: blockedUser.blockedUserAvatar,
    }));
    res.json({
      message: "Blocked users list returned successfully",
      blockedUsers,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving blocked users", error: err });
  }
};

const editUserLocation = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.location === req.body.location) {
      return res
        .status(400)
        .json({ message: "Location is already set to this value" });
    }
    user.location = req.body.location;
    await user.save();
    res.json({ message: "User location updated successfully", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating user location", error: err });
  }
};
const searchUsernames = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const regex = new RegExp(`^${search}`, "i");
    const matchingUsernames = await User.find(
      { userName: regex },
      "_id userName avatarImage"
    );

    const blockedUserIds = user.blockUsers.map((blockedUser) =>
      blockedUser.blockedUserId.toString()
    );
    const matchingUsernamesWithBlockStatus = matchingUsernames.map(
      (matchingUser) => ({
        ...matchingUser._doc,
        isBlocked: blockedUserIds.includes(matchingUser._id.toString()),
      })
    );

    res.json({ matchingUsernames: matchingUsernamesWithBlockStatus });
  } catch (err) {
    res.status(500).json({ message: "Error searching usernames", error: err });
  }
};

const getUserLocation = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      message: "User location retrieved successfully",
      location: user.location,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving user location", error: err });
  }
};
const uploadAvatarImage = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "No file provided for avatar image" });
    }

    const avatarImage = req.files[0];
    const uploadedImageId = await UserUpload.uploadMedia(avatarImage);

    if (!uploadedImageId) {
      return res.status(400).json({ message: "Failed to upload avatar image" });
    }

    user.avatarImage = uploadedImageId;
    await user.save();

    res
      .status(200)
      .json({ message: "Avatar image uploaded successfully", user: user });
  } catch (error) {
    res.status(500).json({ message: "Error uploading avatar image" });
  }
};

const getAvatarImage = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const avatarImageId = user.avatarImage;
    if (!avatarImageId) {
      return res.status(404).json({ message: "Avatar image not found" });
    }

    const avatarImage = await UserUploadModel.findById(avatarImageId);
    if (!avatarImage) {
      return res.status(404).json({ message: "Avatar image not found" });
    }

    res.status(200).send({
      _id: avatarImage._id,
      url: avatarImage.url,
      originalname: avatarImage.originalname,
    });
  } catch (error) {
    res.status(500).json({ message: "Error getting avatar image" });
  }
};
const uploadBannerImage = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "No file provided for banner image" });
    }

    const bannerImage = req.files[0];
    const uploadedImageId = await UserUpload.uploadMedia(bannerImage);

    if (!uploadedImageId) {
      return res.status(400).json({ message: "Failed to upload banner image" });
    }

    user.bannerImage = uploadedImageId;
    await user.save();

    res
      .status(200)
      .json({ message: "Banner image uploaded successfully", user: user });
  } catch (error) {
    res.status(500).json({ message: "Error uploading banner image" });
  }
};

const getBannerImage = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bannerImageId = user.bannerImage;
    if (!bannerImageId) {
      return res.status(404).json({ message: "Banner image not found" });
    }

    const bannerImage = await UserUploadModel.findById(bannerImageId);
    if (!bannerImage) {
      return res.status(404).json({ message: "Banner image not found" });
    }

    res.status(200).send({
      _id: bannerImage._id,
      url: bannerImage.url,
      originalname: bannerImage.originalname,
    });
  } catch (error) {
    res.status(500).json({ message: "Error getting banner image" });
  }
};

const getEmailSettings = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ emailSettings: user.emailSettings });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving email settings", error: err });
  }
};

const editEmailSettings = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.emailSettings.set("privateMessages", req.body.privateMessages);
    user.emailSettings.set("chatRequests", req.body.chatRequests);
    user.emailSettings.set("newUserWelcome", req.body.newUserWelcome);
    user.emailSettings.set("commentOnPost", req.body.commentOnPost);
    user.emailSettings.set("repliesToComments", req.body.repliesToComments);
    user.emailSettings.set("upvotesOnPosts", req.body.upvotesOnPosts);
    user.emailSettings.set("upvotesOnComments", req.body.upvotesOnComments);
    user.emailSettings.set("usernameMentions", req.body.usernameMentions);
    user.emailSettings.set("newFollowers", req.body.newFollowers);
    user.emailSettings.set(
      "unsubscribeFromEmail",
      req.body.unsubscribeFromEmail
    );
    await user.save();
    res.status(200).json({
      message: "User Email settings updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating email settings" });
  }
};

const editChatSettings = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      req.body.chatRequests !== "Everyone" &&
      req.body.chatRequests !== "Nobody" &&
      req.body.chatRequests !== "Accounts Older Than 30 Days"
    ) {
      return res.status(400).json({ message: "Invalid chat request setting" });
    }

    if (
      req.body.privateMessages !== "Everyone" &&
      req.body.privateMessages !== "Nobody" &&
      req.body.privateMessages !== "Accounts Older Than 30 Days"
    ) {
      return res
        .status(400)
        .json({ message: "Invalid private messages setting" });
    }

    user.chatSettings.set("chatRequests", req.body.chatRequests);
    user.chatSettings.set("privateMessages", req.body.privateMessages);
    await user.save();
    res.status(200).json({
      message: "User Chat settings updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating chat settings" });
  }
};

const getChatSettings = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user.chatSettings);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving chat settings" });
  }
};

const getUserSelfInfo = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const createdSeconds = Math.floor(user.createdAt.getTime() / 1000);
    const avatarImageId = user.avatarImage;
    const avatarImage = await UserUploadModel.findById(avatarImageId);
    const response = {
      userId: user._id,
      displayName: user.profileSettings.displayName || user.userName,
      publicDescription: user.publicDescription,
      commentKarma: user.upvotedComments.length - user.downvotedComments.length,
      created: createdSeconds,
      postKarma: user.upvotedPosts.length - user.downvotedPosts.length,
      avatar: avatarImage ? avatarImage.url : null,
      publicDescription: user.publicDescription || null,
    };
    res.status(200).json({ user: response });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving user" });
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otherUser = await User.findById(req.query.userId);
    if (!otherUser) {
      return res.status(404).json({ message: "User Displayed not found" });
    }
    const isFollowed = user.following.includes(otherUser._id);
    const isBlocked = user.blockUsers.some((blockedUser) =>
      blockedUser.blockedUserId.equals(otherUser._id)
    );
    const createdSeconds = Math.floor(otherUser.createdAt.getTime() / 1000);
    const avatarImageId = otherUser.avatarImage;
    const avatarImage = await UserUploadModel.findById(avatarImageId);
    const response = {
      userId: otherUser._id,
      displayName: otherUser.profileSettings.displayName || otherUser.userName,
      publicDescription: otherUser.publicDescription,
      commentKarma:
        otherUser.upvotedComments.length - otherUser.downvotedComments.length,
      created: createdSeconds,
      postKarma:
        otherUser.upvotedPosts.length - otherUser.downvotedPosts.length,
      isFriend: isFollowed,
      isBlocked: isBlocked,
      avatar: avatarImage ? avatarImage.url : null,
      publicDescription: otherUser.publicDescription || null,
    };
    res.status(200).json({ user: response });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving user" });
  }
};

const getCommunitiesInfo = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const communities = await SubReddit.find({
      _id: { $in: user.communities },
    });

    const avatarImages = await UserUploadModel.find({
      _id: {
        $in: communities.map((community) => community.appearance.avatarImage),
      },
    });

    const response = communities.map((community) => {
      const isFavorite = user.favoriteCommunities.includes(community._id);
      const memberCount = community.members.length;
      const avatarImage = avatarImages.find((image) =>
        image._id.equals(community.appearance.avatarImage)
      );

      return {
        communityId: community._id,
        communityName: community.name,
        communityAvatar: avatarImage ? avatarImage.url : null,
        memberCount: memberCount,
        isFavorite: isFavorite,
      };
    });
    res.status(200).json({ communities: response });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving user" });
  }
};

module.exports = {
  getAccountSettings,
  getNotificationSettings,
  editNotificationSettings,
  getProfileSettings,
  editProfileSettings,
  getSafetyAndPrivacySettings,
  editSafetyAndPrivacySettings,
  followUser,
  unfollowUser,
  checkUserNameAvailability,
  blockUser,
  unblockUser,
  addSocialLink,
  editSocialLink,
  deleteSocialLink,
  editFeedSettings,
  viewFeedSettings,
  updateGender,
  muteCommunity,
  unmuteCommunity,
  joinCommunity,
  unjoinCommunity,
  addFavoriteCommunity,
  removeFavoriteCommunity,
  getUpvotedPosts,
  getDownvotedPosts,
  getSavedPosts,
  getHiddenPosts,
  getAllBlockedUsers,
  editUserLocation,
  searchUsernames,
  getUserLocation,
  uploadAvatarImage,
  getAvatarImage,
  uploadBannerImage,
  getBannerImage,
  getEmailSettings,
  editEmailSettings,
  editChatSettings,
  getChatSettings,
  getUserSelfInfo,
  getUserInfo,
  getCommunitiesInfo,
};
