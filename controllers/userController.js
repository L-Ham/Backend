const User = require("../models/user");

const getUserSettings = (req, res, next) => {
  //TODO: const user = TOKENNN
  const user = User.findById(req.params.id)
    .then((user) => {
      console.log("User settings: ", user);
      res.json({ gender: user.gender, email: user.email });
    })
    .catch((err) => {
      console.log(err);
    });
};

const getNotificationSettings = (req, res, next) => {
  const user = User.findById(req.params.id)
    .then((user) => {
      console.log("Notification settings: ", user.notificationSettings);
      res.json({ notificationSettings: user.notificationSettings });
    })
    .catch((err) => {
      console.log(err);
    });
};

const getProfileSettings = (req, res, next) => {
  const user = User.findById(req.params.id)
    .then((user) => {
      const profileSettings = {
        displayName: user.name,
        about: user.About,
        link: user.socialLinks.link,
        appName:user.socialLinks.appName,
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
      console.log(err);
    });
};
const editProfileSettings = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
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
          console.log(err);
          res.status(500).json({ msg: "Server error" });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ msg: "Server error" });
    });
};
const getSafetyAndPrivacySettings = (req, res, next) => {
  const user = User.findById(req.params.id)
    .then((user) => {
      const safetyAndPrivacySettings = {
        blockUser: user.blockUser,
        muteCommunity: user.muteCommunity,
      };
      console.log("Safety and privacy settings: ", safetyAndPrivacySettings);
      res.json({ safetyAndPrivacySettings });
    })
    .catch((err) => {
      console.log(err);
    });
}
const editSafetyAndPrivacySettings = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
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
          console.log(err);
          res.status(500).json({ msg: "Server error" });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ msg: "Server error" });
    });
}
const editNotificationSettings = (req, res, next) => {
  const id = req.params.id;
  const notificationSettings = req.body.notificationSettings;

  User.findByIdAndUpdate(id, { notificationSettings }, { new: true })
    .then((user) => {
      console.log("Updated notification settings: ", user.notificationSettings);
      res.json({ notificationSettings: user.notificationSettings });
    })
    .catch((err) => {
      console.log(err);
    });
}

const createCommunity = (req, res, next) => {
  // token or id???
  const user = User.findById(req.params.id)
    .then((user) => {
      const community = {
        name: req.body.name,
        title: req.body.title,
        description: req.body.description,
        sidebar: req.body.sidebar,
        submissionText: req.body.submissionText,
        type: req.body.privacy,
        contentOptions: req.body.contentOptions,
        wiki: req.body.wiki,
        spamFilter: req.body.spamFilter,
        discoverabilityOptions: req.body.discoverabilityOptions,
        otherOptions: req.body.otherOptions,
        mobileLookAndFeel: req.body.mobileLookAndFeel
      };
      user.community.push(community);
      user.save()
      .then((updatedUser) => {
        console.log("Community created: ", community);
        res.json(community);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ msg: "Server error" });
      });
    })
    .catch((err) => {
      console.log(err);
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
  editSafetyAndPrivacySettings
};
