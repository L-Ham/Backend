const User = require("../models/user");
const authenticateToken= require("../middleware/authenticateToken")

//TODO: add tokens in headers
const getUserSettings = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ msg: "User not found" });
      }
      console.log("User settings: ", user);
      res.json({ gender: user.gender, email: user.email });
    })
    .catch((err) => {
      console.error("Error retrieving user settings:", err);
      res.status(500).json({ msg: "Server error" });
    });
};

const getNotificationSettings = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ msg: "User not found" });
      }
      console.log("Notification settings: ", user.notificationSettings);
      res.json({ notificationSettings: user.notificationSettings });
    })
    .catch((err) => {
      console.error("Error retrieving notification settings:", err);
      res.status(500).json({ msg: "Server error" });
    });
};
const getProfileSettings = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .populate("socialLinks")
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ msg: "User not found" });
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
    })
    .catch((err) => {
      console.error("Error retrieving profile settings:", err);
      res.status(500).json({ msg: "Server error" });
    });
};

const editProfileSettings = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ msg: "User not found" });
      }
      user.profileSettings.set("displayName", req.body.displayName);
      user.profileSettings.set("about", req.body.about);
      user.socialLinks = req.body.socialLinks;
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
      user
        .save()
        .then((updatedUser) => {
          console.log("Profile settings updated: ", updatedUser);
          res.json({
            message: "User profile settings updated successfully",
            user: updatedUser,
          });
        })
        .catch((err) => {
          console.error("Error updating profile settings:", err);
          res.status(500).json({ msg: "Server error" });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ msg: "Server error" });
    });
};

const getSafetyAndPrivacySettings = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ msg: "User not found" });
      }
      const safetyAndPrivacySettings = {
        blockUsers: user.blockUsers,
        muteCommunities: user.muteCommunities,
      };
      console.log("Safety and privacy settings: ", safetyAndPrivacySettings);
      res.json({ safetyAndPrivacySettings });
    })
    .catch((err) => {
      console.error("Error retrieving safety and privacy settings:", err);
      res.status(500).json({ msg: "Server error" });
    });
};
const editSafetyAndPrivacySettings = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ msg: "User not found" });
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
          console.error("Error updating safety and privacy settings:", err);
          res.status(500).json({ msg: "Server error" });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ msg: "Server error" });
    });
};
const editNotificationSettings = (req, res, next) => {
  const userId = req.userId;
  const notificationSettings = req.body.notificationSettings;

  User.findByIdAndUpdate(userId, { notificationSettings }, { new: true })
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ msg: "User not found" });
      }
      console.log("Updated notification settings: ", user.notificationSettings);
      res.json({ notificationSettings: user.notificationSettings });
    })
    .catch((err) => {
      console.error("Error updating notification settings:", err);
      res.status(500).json({ msg: "Server error" });
    });
};

const followUser = (req, res, next) => {
  const userId = req.userId;
  const userTofollowId = req.body.toFollowId;
  User.findById(userId)
    .then((user) => {
      user.following.push();
    })
    .catch(() => {});
};
const unfollowUser = (req, res, next) => {
  const userId = req.userId;
  const userToUnfollowId = req.body.toUnfollowId;
  User.findById(userId)
    .then((user) => {})
    .catch(() => {});
};
module.exports = {
  getUserSettings,
  getNotificationSettings,
  editNotificationSettings,
  getProfileSettings,
  editProfileSettings,
  getSafetyAndPrivacySettings,
  editSafetyAndPrivacySettings,
  followUser,
  unfollowUser,
};
