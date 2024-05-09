const User = require("../models/user");
const SubReddit = require("../models/subReddit");
const Post = require("../models/post");
const UserUploadModel = require("../models/userUploads");
const Comment = require("../models/comment");
const jwt = require("jsonwebtoken");
const UserUpload = require("../controllers/userUploadsController");
const UserServices = require("../services/userServices");
const PostServices = require("../services/postServices");
const NotificationServices = require("../services/notification");
const { get } = require("http");
const { error } = require("console");

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

    res.status(200).json({ accountSettings: accountSettings });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error Retreiving user", error: err.message });
  }
};

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

    const blockUsers = await Promise.all(
      user.blockUsers.map(async (blockedUser) => {
        const avatarImage = await UserUploadModel.findById(
          blockedUser.blockedUserAvatar
        );
        return {
          blockedUserName: blockedUser.blockedUserName,
          blockedUserAvatar: avatarImage ? avatarImage.url : null,
          blockedAt: blockedUser.blockedAt,
        };
      })
    );

    const muteCommunities = await Promise.all(
      user.muteCommunities.map(async (mutedCommunity) => {
        const avatarImage = await UserUploadModel.findById(
          mutedCommunity.mutedCommunityAvatar
        );
        return {
          mutedCommunityName: mutedCommunity.mutedCommunityName,
          mutedCommunityAvatar: avatarImage ? avatarImage.url : null,
          mutedAt: mutedCommunity.mutedAt,
        };
      })
    );

    const safetyAndPrivacySettings = {
      blockUsers,
      muteCommunities,
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
    // console.log(userToFollow);
    // const receiver = await User.findById(post.user);
    // console.log(userToFollow.notificationSettings.get("newFollowers"));
    await Promise.all([user.save(), userToFollow.save()]);

    if (userToFollow.notificationSettings.get("newFollowers")) {
      await NotificationServices.sendNotification(
        userToFollow.userName,
        user.userName,
        null,
        null,
        "followed"
      );
      res
        .status(200)
        .json({ message: "User followed successfully & Notification Sent" });
    } else {
      res.status(200).json({
        message: "User followed successfully & Notification Not Required",
      });
    }

    // res.status(200).json({
    //   message: "User followed successfully",
    //   user: userToFollow,
    // });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to follow user", error: err.message });
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
      return res.status(400).json({ message: "User already blocked" });
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
    const user = await User.findById(userId);
    const community = await SubReddit.findById(communityId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    if (
      community.bannedUsers.some((bannedUser) =>
        bannedUser.userId.equals(user._id)
      )
    ) {
      return res.status(400).json({ message: "User is banned from community" });
    }
    // Handle join logic based on community privacy
    if (community.privacy === "private" || community.privacy === "Private") {
      if (
        community.pendingMembers.includes(userId) ||
        community.members.includes(userId)
      ) {
        console.log(community.members.includes(userId));
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
    res
      .status(500)
      .json({ message: "Error joining community", error: err.message });
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
    // if (!user.communities.includes(communityId)) {
    //   return res
    //     .status(400)
    //     .json({ message: "User is not a member of this community" });
    // }
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
  const username = req.query.username;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  try {
    const user = await User.findOne({ userName: username });
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
        const isUpvoted = post.upvotedUsers.includes(user._id);
        const isDownvoted = post.downvotedUsers.includes(user._id);
        const isSaved = user.savedPosts.includes(post._id);
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
          isSaved,
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
  const username = req.query.username;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  try {
    const user = await User.findOne({ userName: username });
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
        const isUpvoted = post.upvotedUsers.includes(user._id);
        const isDownvoted = post.downvotedUsers.includes(user._id);
        const isSaved = user.savedPosts.includes(post._id);
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
          isSaved,
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
  const username = req.query.username;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  try {
    const user = await User.findOne({ userName: username });
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
        const isUpvoted = post.upvotedUsers.includes(user._id);
        const isDownvoted = post.downvotedUsers.includes(user._id);
        const isSaved = user.savedPosts.includes(post._id);
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
          isSaved,
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
  const username = req.query.username;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  try {
    const user = await User.findOne({ userName: username });
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
        const isUpvoted = post.upvotedUsers.includes(user._id);
        const isDownvoted = post.downvotedUsers.includes(user._id);
        const isSaved = user.savedPosts.includes(post._id);
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
          isSaved,
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
const getUserComments = async (req, res) => {
  const username = req.query.username;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  try {
    const user = await User.findOne({ userName: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const query = Comment.find({ userId: user._id });
    const result = await UserServices.paginateResults(query, page, limit);
    if (result.slicedArray.length == 0) {
      return res.status(500).json({ message: "The retrieved array is empty" });
    }
    const userComments = await Promise.all(
      result.slicedArray.map(async (comment) => {
        const isUpvoted = comment.upvotedUsers.includes(user._id);
        const isDownvoted = comment.downvotedUsers.includes(user._id);
        const post = await Post.findById(comment.postId);
        const subreddit = await SubReddit.findById(post.subReddit);
        const score = comment.upvotes - comment.downvotes;
        let usernameRepliedTo = "";
        if (comment.parentCommentId !== null) {
          const parentComment = await Comment.findById(comment.parentCommentId);
          const parentCommentUser = await User.findById(parentComment.userId);
          usernameRepliedTo = parentCommentUser
            ? parentCommentUser.userName
            : null;
        } else {
          const parentPost = await Post.findById(comment.postId);
          const parentPostUser = await User.findById(parentPost.user);
          usernameRepliedTo = parentPostUser ? parentPostUser.userName : null;
        }
        const commentObj = {
          commentId: comment._id,
          content: comment.text,
          subredditName: subreddit ? subreddit.name : null,
          postTitle: post ? post.title : null,
          postId: comment.postId,
          usernameRepliedTo: usernameRepliedTo,
          score,
          isUpvoted,
          isDownvoted,
        };
        return commentObj;
      })
    );
    return res.status(200).json({
      message: "Retrieved User's Comments",
      hiddenPosts: userComments,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error Getting User Comments",
      error: err.message,
    });
  }
};

const getUserPosts = async (req, res) => {
  const username = req.query.username;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  try {
    const user = await User.findOne({ userName: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const query = Post.find({ user: user._id });
    const result = await UserServices.paginateResults(query, page, limit);
    console.log(result.slicedArray);
    if (result.slicedArray.length == 0) {
      return res.status(500).json({ message: "The retrieved array is empty" });
    }
    const postsWithVoteStatus = await Promise.all(
      result.slicedArray.map(async (post) => {
        const isUpvoted = post.upvotedUsers.includes(user._id);
        const isDownvoted = post.downvotedUsers.includes(user._id);
        const isSaved = user.savedPosts.includes(post._id);
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
          isSaved,
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
      message: "Retrieved User's Posts",
      userPosts: postsWithVoteStatus,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error Getting User's Posts",
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
      { userName: regex, _id: { $ne: userId } },
      "_id userName avatarImage profileSettings"
    );

    const blockedUserIds = user.blockUsers.map((blockedUser) =>
      blockedUser.blockedUserId.toString()
    );

    const matchingUsernamesWithBlockStatus = await Promise.all(
      matchingUsernames.map(async (matchingUser) => {
        const avatarImageUrl = await UserUploadModel.findById(
          matchingUser.avatarImage
        );
        return {
          ...matchingUser._doc,
          avatarImageUrl: avatarImageUrl ? avatarImageUrl.url : null,
          isBlocked: blockedUserIds.includes(matchingUser._id.toString()),
        };
      })
    );

    res.json({ matchingUsernames: matchingUsernamesWithBlockStatus });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error searching usernames", error: err.message });
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
    const bannerImageId = user.bannerImage;
    const avatarImage = await UserUploadModel.findById(avatarImageId);
    const bannerImage = await UserUploadModel.findById(bannerImageId);
    const response = {
      userId: user._id,
      displayName: user.profileSettings.get("displayName") || null,
      username: user.userName,
      commentKarma: user.upvotedComments.length - user.downvotedComments.length,
      created: createdSeconds,
      postKarma: user.upvotedPosts.length - user.downvotedPosts.length,
      avatar: avatarImage ? avatarImage.url : null,
      banner: bannerImage ? bannerImage.url : null,
      About: user.profileSettings.get("about") || null,
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
    const bannerImageId = otherUser.bannerImage;
    const bannerImage = await UserUploadModel.findById(bannerImageId);
    const response = {
      userId: otherUser._id,
      displayName: otherUser.profileSettings.get("displayName") || null,
      username: otherUser.userName,
      commentKarma:
        otherUser.upvotedComments.length - otherUser.downvotedComments.length,
      created: createdSeconds,
      postKarma:
        otherUser.upvotedPosts.length - otherUser.downvotedPosts.length,
      isFriend: isFollowed,
      isBlocked: isBlocked,
      avatar: avatarImage ? avatarImage.url : null,
      banner: bannerImage ? bannerImage.url : null,
      About: otherUser.profileSettings.get("about") || null,
      socialLinks: otherUser.socialLinks,
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
        isModerator: community.moderators.includes(userId),
      };
    });
    res.status(200).json({ communities: response });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving user" });
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving User Notifications",
      error: err.message,
    });
  }
};
const getHistoryPosts = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const posts = await Post.find({ _id: { $in: user.historyPosts } });

    res.status(200).json({
      message: "Retrieved User's History Posts",
      historyPosts: posts,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error Getting Posts in User History",
      error: err.message,
    });
  }
};

const searchPosts = async (req, res) => {
  const userId = req.userId;
  const userName = req.query.username;
  const search = req.query.search;
  const relevance = req.query.relevance === "true";
  const top = req.query.top === "true";
  const newest = req.query.new === "true";
  const mediaOnly = req.query.mediaOnly === "true";
  const isNSFW = req.query.isNSFW === "true";
  try {
    let userme;
    if (userId) {
      userme = await User.findById(userId);
    }
    const user = await User.findOne({ userName: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userPosts = await Post.find({ user: user._id });
    const postIds = userPosts.map((post) => post._id);
    let query = {};
    if (mediaOnly === true && isNSFW === true) {
      query = {
        _id: { $in: postIds },
        $or: [
          { title: { $regex: search, $options: "i" } },
          { text: { $regex: search, $options: "i" } },
        ],
        images: { $exists: true, $ne: [] },
      };
    }

    if (mediaOnly === false && isNSFW === true) {
      query = {
        _id: { $in: postIds },
        $or: [
          { title: { $regex: search, $options: "i" } },
          { text: { $regex: search, $options: "i" } },
        ],
      };
    }

    if (mediaOnly === true && isNSFW === false) {
      query = {
        _id: { $in: postIds },
        $or: [
          { title: { $regex: search, $options: "i" } },
          { text: { $regex: search, $options: "i" } },
        ],
        isNSFW: false,
        images: { $exists: true, $ne: [] },
      };
    }

    if (mediaOnly === false && isNSFW === false) {
      query = {
        _id: { $in: postIds },
        $or: [
          { title: { $regex: search, $options: "i" } },
          { text: { $regex: search, $options: "i" } },
        ],
        isNSFW: false,
      };
    }
    let sort = {};
    if (relevance || top) {
      sort.upvotes = -1;
    }
    if (newest) {
      sort.createdAt = -1;
    }
    const populatedPosts = await Post.find(query)
      .sort(sort)
      .populate({
        path: "user",
        model: "user",
        populate: {
          path: "avatarImage",
          model: "userUploads",
        },
      })
      .populate({
        path: "images",
        model: "userUploads",
      })
      .populate({
        path: "videos",
        model: "userUploads",
      });
    const posts = await Promise.all(
      populatedPosts.map(async (post) => {
        const score = post.upvotes - post.downvotes;
        const isFriend = userme
          ? userme.following.includes(post.userId)
          : false;
        const isMember = userme
          ? userme.communities.includes(post.subReddit)
          : false;
        let avatarImage = null;
        if (post.user && post.user.avatarImage) {
          avatarImage = post.user.avatarImage.url;
        }
        let userBanner = null;
        console.log(post.user);
        console.log(post.user.bannerImage);
        if (post.user && post.user.bannerImage) {
          userBanner = post.user.bannerImage.url;
          console.log(userBanner);
        }
        let subReddit = null;
        if (post.subReddit) {
          subReddit = await SubReddit.findById(post.subReddit);
        }
        let avatarImageSubReddit = null;
        if (subReddit) {
          const avatarImageId = subReddit.appearance.avatarImage;
          avatarImageSubReddit = avatarImageId
            ? await UserUploadModel.findById(avatarImageId.toString())
            : null;
        }
        let subredditBanner = null;
        if (subReddit) {
          const bannerImageId = subReddit.appearance.bannerImage;
          subredditBanner = bannerImageId
            ? await UserUploadModel.findById(bannerImageId.toString())
            : null;
        }

        return {
          postId: post._id,
          title: post.title,
          type: post.type,
          text: post.text,
          image:
            post.images && post.images.length > 0 ? post.images[0].url : null,
          video: post.videos.url || null,
          URL: post.url,
          postUpvotes: post.upvotes,
          postDownvotes: post.downvotes,
          postCommentCount: post.comments.length,
          postKarma: post.upvotes - post.downvotes,
          postCommentKarma: post.comments.length,
          score: score,
          isUpvoted: post.upvotes > 0,
          isDownvoted: post.downvotes > 0,
          isNSFW: post.isNSFW,
          postCreatedAt: post.createdAt,
          userId: post.user ? post.user._id : null,
          userName: post.user ? post.user.userName : null,
          userAbout: post.user.profileSettings.get("about") || null,
          userNickName: post.user.profileSettings.get("displayName") || null,
          userAvatarImage: avatarImage,
          userBannerImage: userBanner,
          userKarma:
            post.user.upvotedPosts.length - post.user.downvotedPosts.length,
          userCreatedAt: post.user.createdAt,
          subredditName: subReddit ? subReddit.name : null,
          subRedditId: subReddit ? subReddit._id : null,
          avatarImageSubReddit: avatarImageSubReddit
            ? avatarImageSubReddit.url
            : null,
          subredditBanner: subredditBanner ? subredditBanner.url : null,
          subRedditDescription: subReddit ? subReddit.description : null,
          subRedditMembers: subReddit ? subReddit.members.length : null,
          subRedditNickName: subReddit ? subReddit.membersNickname : null,
          subRedditCreated: subReddit ? subReddit.createdAt : null,
          subredditcurrentlyViewingNickname: subReddit
            ? subReddit.currentlyViewingNickname
            : null,
          isFriend: isFriend,
          isMember: isMember,
        };
      })
    );
    let sortedPosts = posts;
    if (relevance === true) {
      sortedPosts = posts.sort(
        (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
      );
    } else if (newest === true) {
      sortedPosts = posts.sort((a, b) => b.createdAt - a.createdAt);
    } else if (top === true) {
      sortedPosts = posts.sort(
        (a, b) =>
          b.upvotes -
          b.downvotes +
          b.comments.length -
          (a.upvotes - a.downvotes + a.comments.length)
      );
    }
    res.status(200).json({
      message: "Posts retrieved successfully",
      posts: sortedPosts,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error searching posts",
      error: err.message,
    });
  }
};

const searchComments = async (req, res) => {
  const userId = req.userId;
  const userName = req.query.username;
  const search = req.query.search;
  const relevance = req.query.relevance === "true";
  const top = req.query.top === "true";
  const newest = req.query.new === "true";
  try {
    let userme;
    if (userId) {
      userme = await User.findById(userId);
    }
    const user = await User.findOne({ userName: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userComments = await Comment.find({ userId: user._id });
    const commentIds = userComments.map((comment) => comment._id);
    let query = {};
    if (search) {
      query = {
        _id: { $in: commentIds },
        text: { $regex: search, $options: "i" },
      };
    }
    let sort = {};
    if (relevance || top) {
      sort.upvotes = -1;
    }
    if (newest) {
      sort.createdAt = -1;
    }
    const populatedComments = await Comment.find(query)
      .sort(sort)
      .populate({
        path: "userId",
        model: "user",
      })
      .populate({
        path: "images",
        model: "userUploads",
      })
      .populate({
        path: "postId",
        model: "post",
      });
    const comments = await Promise.all(
      populatedComments.map(async (comment) => {
        const score = comment.upvotes - comment.downvotes;
        const subredditId = comment.postId.subReddit;
        const isFriend = userme
          ? userme.following.includes(comment.userId)
          : false;
        const isMember = userme
          ? userme.communities.includes(comment.postId.subReddit)
          : false;
        let subreddittemp;
        let subredditAvatarId;
        let subredditAvatar;
        if (subredditId) {
          subreddittemp = await SubReddit.findById(subredditId);
          subredditAvatarId = subreddittemp.appearance.avatarImage;
          if (subredditAvatarId) {
            subredditAvatar = await UserUploadModel.findById(subredditAvatarId);
          }
        }
        let subredditBanner = null;
        if (subredditId) {
          const bannerImageId = subreddittemp.appearance.bannerImage;
          subredditBanner = bannerImageId
            ? await UserUploadModel.findById(bannerImageId.toString())
            : null;
        }
        let userAvatarId = comment.userId.avatarImage;
        let userAvatar;
        if (userAvatarId) {
          userAvatar = await UserUploadModel.findById(userAvatarId);
        }
        let userBannerId = comment.userId.bannerImage;
        let userBanner;
        if (userBannerId) {
          userBanner = await UserUploadModel.findById(userBannerId);
        }

        return {
          _id: comment._id,
          postId: comment.postId._id,
          userId: comment.userId._id,
          userName: comment.userId.userName,
          userAbout: comment.userId.profileSettings.get("about") || null,
          userNickName:
            comment.userId.profileSettings.get("displayName") || null,
          userAvatar: userAvatarId ? userAvatar.url : null,
          userBanner: userBannerId ? userBanner.url : null,
          userKarma:
            comment.userId.upvotedPosts.length -
            comment.userId.downvotedPosts.length,
          userCreatedAt: comment.userId.createdAt,
          postCreatedAt: comment.postId.createdAt,
          postTitle: comment.postId.title,
          postText: comment.postId.text,
          postUpvotes: comment.postId.upvotes,
          postDownvotes: comment.postId.downvotes,
          postCommentCount: comment.postId.comments.length,
          score: score,
          subredditId: subredditId,
          subRedditName: subredditId ? subreddittemp.name : null,
          subRedditAvatar: subredditAvatarId ? subredditAvatar.url : null,
          subRedditBanner: subredditBanner ? subredditBanner.url : null,
          subRedditDescription: subredditId ? subreddittemp.description : null,
          subRedditMembers: subredditId ? subreddittemp.members.length : null,
          isFriend: isFriend,
          isMember: isMember,
          subRedditNickName: subredditId ? subreddittemp.membersNickname : null,
          subRedditCreatedAt: subredditId ? subreddittemp.createdAt : null,
          subredditcurrentlyViewingNickname: subredditId
            ? subreddittemp.currentlyViewingNickname
            : null,
          commentText: comment.text,
          commentImage: comment.images,
          commentUpvotes: comment.upvotes,
          commentDownvotes: comment.downvotes,
          commentKarma: comment.upvotes - comment.downvotes,
          commentCreatedAt: comment.createdAt,
        };
      })
    );
    let sortedComments = comments;
    if (relevance === true) {
      sortedComments = comments.sort(
        (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
      );
    } else if (newest === true) {
      sortedComments = comments.sort((a, b) => b.createdAt - a.createdAt);
    } else if (top === true) {
      sortedComments = comments.sort(
        (a, b) => b.upvotes * b.downvotes - a.upvotes * a.downvotes
      );
    }
    res
      .status(200)
      .json({ message: "Comments fetched", comments: sortedComments });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching comments", error: err.message });
  }
};

const getUserDetails = async (req, res) => {
  const username = req.query.username;
  try {
    const user = await User.findOne({ userName: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const createdSeconds = Math.floor(user.createdAt.getTime() / 1000);
    const avatarImageId = user.avatarImage;
    const bannerImageId = user.bannerImage;
    const avatarImage = await UserUploadModel.findById(avatarImageId);
    const bannerImage = await UserUploadModel.findById(bannerImageId);
    const response = {
      userId: user._id,
      displayName: user.profileSettings.get("displayName") || null,
      username: user.userName,
      commentKarma: user.upvotedComments.length - user.downvotedComments.length,
      created: createdSeconds,
      postKarma: user.upvotedPosts.length - user.downvotedPosts.length,
      avatar: avatarImage ? avatarImage.url : null,
      banner: bannerImage ? bannerImage.url : null,
      About: user.profileSettings.get("about") || null,
    };
    res.status(200).json({ user: response });
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
  getUserComments,
  getUserPosts,
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
  getNotifications,
  getHistoryPosts,
  searchPosts,
  searchComments,
  getUserDetails,
};
