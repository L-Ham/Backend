const User = require("../models/user");

//TODO: add tokens in headers
const getUserSettings = (req, res, next) => {
  //TODO: const user = TOKENNN
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
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ msg: "User not found" });
      }
      const profileSettings = {
        displayName: user.name,
        about: user.About,
        link: user.socialLinks.link,
        appName: user.socialLinks.appName,
        avatar: user.avatar,
        bannerImage: user.bannerImage,
        NSFW: user.isNSFW,
        allowFollow: user.allowFollow,
        contentVisibility: user.contentVisibility,
        communityVisibility: user.communityVisibility,
        clearHistory: user.clearHistory,
      };
      console.log("Profile settings: ", profileSettings);
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
      user.name = req.body.name;
      user.About = req.body.About;
      user.socialLinks.link = req.body.link;
      user.socialLinks.appName = req.body.appName;
      user.avatar = req.body.avatar;
      user.bannerImage = req.body.bannerImage;
      user.isNSFW = req.body.isNSFW;
      user.allowFollow = req.body.allowFollow;
      user.contentVisibility = req.body.contentVisibility;
      user.communityVisibility = req.body.communityVisibility;
      user.clearHistory = req.body.clearHistory;
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
        blockUser: user.blockUser,
        muteCommunity: user.muteCommunity,
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
      user.blockUser = req.body.blockUser;
      user.muteCommunity = req.body.muteCommunity;
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

const createCommunity = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ msg: "User not found" });
      }
      const community = {
        name: req.body.name,
        type: req.body.privacy,
        ageRestriction: req.body.ageRestriction,
      };
      user.communities.push(community);
      user
        .save()
        .then((updatedUser) => {
          console.log("Community created: ", community);
          res.json(community);
        })
        .catch((err) => {
          console.error("Error saving community:", err);
          res.status(500).json({ msg: "Server error" });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ msg: "Server error" });
    });
};

module.exports = {
  getUserSettings,
  getNotificationSettings,
  editNotificationSettings,
  getProfileSettings,
  editProfileSettings,
  getSafetyAndPrivacySettings,
  createCommunity,
  editSafetyAndPrivacySettings,
};
