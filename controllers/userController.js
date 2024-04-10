const User = require("../models/user");
const authenticateToken = require("../middleware/authenticateToken");
const jwt = require("jsonwebtoken");
const { updateOne } = require("../models/socialLink");
const SubReddit = require("../models/subReddit");
const subReddit = require("../models/subReddit");

const getNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ notificationSettings: user.notificationSettings });
  } catch (err) {
    console.log("Error retrieving notification settings:", err);
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
      console.log("User not found for user ID:", userId);
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
    console.log("Error retrieving profile settings:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const editProfileSettings = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found for user ID:", userId);
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

    console.log("Profile settings updated: ", updatedUser);
    res.json({
      message: "User profile settings updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.log("Error updating profile settings:", err);
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
      console.log("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const accountSettings = {
      email: user.email,
      gender: user.gender,
      connectedToGoogle: user.signupGoogle,
    };

    console.log("Account settings: ", accountSettings);
    res.json({ accountSettings });
  } catch (err) {
    console.log("Error retrieving account settings:", err);
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
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const safetyAndPrivacySettings = {
      blockUsers: user.blockUsers,
      muteCommunities: user.muteCommunities,
    };
    res.json({ safetyAndPrivacySettings });
  } catch (err) {
    console.log("Error retrieving safety and privacy settings:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//REDUNDANT
const editSafetyAndPrivacySettings = (req, res, next) => {
  const userId = req.userId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.log("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      user.blockUsers = req.body.blockUsers;
      user.muteCommunities = req.body.muteCommunities;
      user
        .save()
        .then((updatedUser) => {
          console.log("Safety and privacy settings updated: ", updatedUser);
          res.json({
            message: "User safety and privacy settings updated successfully",
            user: updatedUser,
          });
        })
        .catch((err) => {
          console.log("Error updating safety and privacy settings:", err);
          res
            .status(500)
            .json({ message: "Failed to update safety and privacy settings " });
        });
    })
    .catch((err) => {
      console.log("Error retrieving user:", err);
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
      console.log("User not found for user ID:", userId);
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
    console.log("Error updating Notification settings:", err);
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
    if (user.blockUsers.includes(userToFollow._id)) {
      return res.status(400).json({ message: "You have blocked this user" });
    }
    if (userToFollow.blockUsers.includes(user._id)) {
      return res
        .status(400)
        .json({ message: "You have been blocked by this user" });
    }
    console.log(user.following.includes(userToFollow._id));
    console.log(user.following);
    console.log(userToFollow._id);
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
    console.log(err);
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
      console.log("Username is empty");
      return res.status(400).json({ message: "Username is empty" });
    }

    const user = await User.findOne({ userName: userName });

    if (user) {
      console.log("Username already taken:", userName);
      return res.status(409).json( false );
    }

    console.log("Username available:", userName);
    res.json( true );
  } catch (err) {
    console.log("Error checking username availability:", err);
    if (res.status) {
      res.status(500).json({ message: "Server error" });
    } else {
      console.log("Invalid res object:", res);
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
      console.log("User not found for username:", blockedUserName);
      return res.status(404).json({ message: "User not found" });
    }
    if (userToBlock._id.equals(userId)) {
      return res.status(400).json({ message: "User cannot block themselves" });
    }
    userToBlock.following.pull(userId);
    await userToBlock.save();
    const user = await User.findById(userId);

    if (user.blockUsers.includes(userToBlock._id)) {
      console.log("User already blocked:", userToBlock.userName);
      return res.status(409).json({ message: "User already blocked" });
    }
    user.blockUsers.push(userToBlock._id);
    user.followers.pull(userToBlock._id);
    const updatedUser = await user.save();

    console.log("User blocked:", userToBlock.userName);
    res.json({ message: "User blocked", user: updatedUser });
  } catch (err) {
    console.log("Error blocking user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const unblockUser = (req, res, next) => {
  const userId = req.userId;
  const blockedUserName = req.body.UserNameToUnblock;
  User.findOne({ userName: blockedUserName })
    .then((user) => {
      if (!user) {
        console.log("User not found for username:", blockedUserName);
        return res.status(404).json({ message: "User not found" });
      }
      User.findByIdAndUpdate(
        userId,
        { $pull: { blockUsers: user._id } },
        { new: true }
      )
        .then((updatedUser) => {
          console.log("User unblocked:", user.userName);
          res.json({ message: "User unblocked", user: updatedUser });
        })
        .catch((err) => {
          console.log("Error unblocking user:", err);
          res.status(500).json({ message: "Server error" });
        });
    })
    .catch((err) => {
      console.log("Error retrieving user:", err);
      res.status(500).json({ message: "Server error" });
    });
};

async function editFeedSettings(req, res, next) {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found for user ID:", userId);
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
    console.log("Feed settings updated: ", updatedUser);
    res.json({
      message: "User Feed settings updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function viewFeedSettings(req, res, next) {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found for user ID:", userId);
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
    console.log("Error retrieving feed settings:", err);
    res.status(500).json({ message: "Server error" });
  }
}
async function addSocialLink(req, res, next) {
  try {
    const userId = req.userId;
    const { linkOrUsername, appName, logo, displayText } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    if (user.socialLinks.length >= 5) {
      console.log("User has reached the maximum number of social links");
      return res
        .status(400)
        .json({ message: "Maximum number of social links reached" });
    }

    user.socialLinks.push({ linkOrUsername, appName, logo, displayText });

    const updatedUser = await user.save();
    console.log("Social link added: ", updatedUser);
    res.json({ message: "Social link added successfully", user: updatedUser });
  } catch (err) {
    console.log("Error adding social link:", err);
    res
      .status(500)
      .json({ message: "Error adding social link to user", error: err });
  }
}

const editSocialLink = async (req, res, next) => {
  const userId = req.userId;
  const { linkId, linkOrUsername, appName, logo, displayText } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const socialLinkToUpdate = user.socialLinks.find(
      (link) => link._id.toString() === linkId
    ); // Ensure proper comparison

    if (!socialLinkToUpdate) {
      console.log("Social link not found for link ID:", linkId);
      return res.status(404).json({ message: "Social link not found" });
    }

    socialLinkToUpdate.linkOrUsername = linkOrUsername;
    socialLinkToUpdate.appName = appName;
    socialLinkToUpdate.logo = logo;
    socialLinkToUpdate.displayText = displayText;

    const updatedUser = await user.save();

    console.log("Social link updated: ", updatedUser);
    res.json({
      message: "Social link updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.log("Error updating social link:", err);
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
      console.log("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const socialLinkToDelete = user.socialLinks.find(
      (link) => link._id.toString() === linkId
    );
    if (!socialLinkToDelete) {
      console.log("Social link not found for link ID:", linkId);
      return res.status(404).json({ message: "Social link not found" });
    }

    user.socialLinks.pull(socialLinkToDelete);
    const updatedUser = await user.save();

    console.log("Social link deleted: ", updatedUser);
    res.json({
      message: "Social link deleted successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.log("Error deleting social link:", err);
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
      console.log("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    if (user.gender === req.body.gender) {
      return res
        .status(400)
        .json({ message: "Gender is already set to this value" });
    }

    user.gender = req.body.gender;
    const updatedUser = await user.save();

    res.status(200).json({
      message: "User gender updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.log("Error updating user gender:", err);
    res.status(500).json({
      message: "Failed to update User Gender",
      error: err,
    });
  }
};

const muteCommunity = async (req, res, next) => {
  try {
    const userId = req.userId;
    const communityId = req.body.subRedditId;

    const [user, community] = await Promise.all([
      User.findById(userId),
      subReddit.findById(communityId),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    if (!user.communities.includes(communityId)) {
      return res
        .status(400)
        .json({ message: "User is not a member of this community" });
    }
    if (user.muteCommunities.includes(communityId)) {
      return res.status(400).json({ message: "Community already muted" });
    }

    user.muteCommunities.push(communityId);
    await user.save();

    console.log("Community muted: ", user);
    res.json({
      message: "Community muted successfully",
      user,
    });
  } catch (err) {
    console.log("Error muting community:", err);
    res.status(500).json({
      message: "Error muting community for user",
      error: err,
    });
  }
};

const unmuteCommunity = async (req, res, next) => {
  try {
    const userId = req.userId;
    const communityId = req.body.subRedditId;

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const community = await subReddit.findById(communityId);
    if (!community) {
      console.log("Community not found for community ID:", communityId);
      return res.status(404).json({ message: "Community not found" });
    }

    const isMuted = user.muteCommunities.find((muteCommunity) =>
      muteCommunity.equals(communityId)
    );
    if (!isMuted) {
      console.log("This subReddit is not muted for you:", communityId);
      return res
        .status(404)
        .json({ message: "This subReddit is not muted for you" });
    }

    user.muteCommunities.pull(communityId);
    await user.save();

    console.log("Community unmuted: ", user);
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
    console.log("Error favoriting community:", err);
    res.status(500).json({ message: "Error favoriting community", error: err });
  }
};

const removeFavoriteCommunity = async (req, res) => {
  try {
    const userId = req.userId;
    const communityId = req.body.subRedditId;

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for user ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    const community = await SubReddit.findById(communityId);
    if (!community) {
      console.log("Community not found for community ID:", communityId);
      return res.status(404).json({ message: "Community not found" });
    }
    if (!user.communities.includes(communityId)) {
      console.log("User is not a member of this community");
      return res
        .status(400)
        .json({ message: "User is not a member of this community" });
    }
    if (!user.favoriteCommunities.includes(communityId)) {
      console.log("Community not favorited: ", community);
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
    console.log("Error unfavoriting community:", err);
    res
      .status(500)
      .json({ message: "Error unfavoriting community", error: err });
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
};
