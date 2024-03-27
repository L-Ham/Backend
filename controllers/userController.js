const User = require("../models/user");
const authenticateToken = require("../middleware/authenticateToken");
const jwt = require("jsonwebtoken");
const { updateOne } = require("../models/socialLink");
const SubReddit = require("../models/subReddit");
const subReddit = require("../models/subReddit");

const getNotificationSettings = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ notificationSettings: user.notificationSettings });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Error retrieving notification settings",
        error: err,
      });
    });
};
const getProfileSettings = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .populate("socialLinks")
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
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
        communitiesVisibility: user.profileSettings.get(
          "communitiesVisibility"
        ),
        clearHistory: user.profileSettings.get("clearHistory"),
      };

      res.json({ profileSettings });
    })
    .catch((err) => {
      console.error("Error retrieving profile settings:", err);
      res.status(500).json({ message: "Server error" });
    });
};

const editProfileSettings = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
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
          res
            .status(500)
            .json({ message: "Error updating profile settings", error: err });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Server error" });
    });
};
const getAccountSettings = (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(404).json({ message: "User not found" });
  }
  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      const accountSettings = {
        email: user.email,
        gender: user.gender,
        connectedToGoogle: user.signupGoogle,
      };
      console.log("Account settings: ", accountSettings);
      res.json({ accountSettings });
    })
    .catch((err) => {
      console.error("Error retrieving account settings:", err);
      res.status(500).json({ message: "Error Retreiving user", error: err });
    });
};

const getSafetyAndPrivacySettings = (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(404).json({ message: "User Id not provided" });
  }
  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      const safetyAndPrivacySettings = {
        blockUsers: user.blockUsers,
        muteCommunities: user.muteCommunities,
      };
      res.json({ safetyAndPrivacySettings: safetyAndPrivacySettings });
    })
    .catch((err) => {
      console.error("Error retrieving safety and privacy settings:", err);
      res.status(500).json({ message: "Server error" });
    });
};

//REDUNDANT
const editSafetyAndPrivacySettings = (req, res, next) => {
  const userId = req.userId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
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
          console.error("Error updating safety and privacy settings:", err);
          res
            .status(500)
            .json({ message: "Failed to update safety and privacy settings " });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Server error" });
    });
};
const editNotificationSettings = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
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
      user
        .save()
        .then((user) => {
          console.log("Notification settings updated: ", user);
          res.json({
            message: "User Notification settings updated successfully",
            user: user,
          });
        })
        .catch((err) => {
          console.error("Error updating Notification settings:", err);
          res.status(500).json({ message: "Server error" });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Server error" });
    });
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

    if (user.blockUsers.includes(userToFollow._id)) {
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
    console.log(err); // Log error for debugging
    res.status(500).json({ message: "Failed to follow user", error: err });
  }
};

const unfollowUser = (req, res, next) => {
  const userId = req.userId;
  const usernameToUnfollow = req.body.usernameToUnfollow;
  User.findById(userId)
    .then((user) => {
      User.findOne({ userName: usernameToUnfollow })
        .then(async (userToUnfollow) => {
          if (!user.following.includes(userToUnfollow._id)) {
            return res.status(500).json({ message: "User not followed" });
          }
          user.following.pull(userToUnfollow._id);
          userToUnfollow.followers.pull(userId);
          await user.save();
          userToUnfollow.save();
          res.status(200).json({ message: "User unfollowed successfully" });
        })
        .catch((err) => {
          res.status(500).json({
            message: "Failed to find the user to unfollow",
            error: err,
          });
        });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Unfollow user Request Failed", error: err });
    });
};

const checkUserNameAvailability = (req, res, next) => {
  const userName = req.query.username;
  console.log("Checking username availability:", userName);
  if (userName === "") {
    console.error("Username is empty");
    return res.status(400).json({ message: "Username is empty" });
  }
  User.findOne({ userName: userName })
    .then((user) => {
      if (user) {
        console.error("Username already taken:", userName);
        return res.status(409).json({ message: "Username already taken" });
      }
      console.log("Username available:", userName);
      res.json({ message: "Username available" });
    })
    .catch((err) => {
      console.error("Error checking username availability:", err);
      // Ensure that res is an instance of the Express response object
      if (res.status) {
        res.status(500).json({ message: "Server error" });
      } else {
        // Handle the case where res is not an Express response object
        console.error("Invalid res object:", res);
        next(err);
      }
    });
};

const blockUser = (req, res, next) => {
  const blockedUserName = req.body.usernameToBlock;
  const userId = req.userId;
  User.findOne({ userName: blockedUserName }).then((userToBlock) => {
    if (!userToBlock) {
      console.error("User not found for username:", blockedUserName);
      return res.status(404).json({ message: "User not found" });
    }
    userToBlock.following.pull(userId);
    userToBlock.followers.pull(userId);
    userToBlock.save();

    User.findById(userId)
      .then((user) => {
        if (user.blockUsers.includes(userToBlock._id)) {
          console.error("User already blocked:", userToBlock.userName);
          return res.status(409).json({ message: "User already blocked" });
        }
        user.blockUsers.push(userToBlock._id);
        user.following.pull(userToBlock._id);
        user.followers.pull(userToBlock._id);

        user
          .save()
          .then((updatedUser) => {
            console.log("User blocked:", userToBlock.userName);
            res.json({ message: "User blocked", user: updatedUser });
          })

          .catch((err) => {
            console.error("Error blocking user:", err);
            res.status(500).json({ message: "Server error" });
          });
      })
      .catch((err) => {
        console.error("Error retrieving user:", err);
        res.status(500).json({ message: "Server error" });
      });
  });
};

const unblockUser = (req, res, next) => {
  const userId = req.userId;
  const blockedUserName = req.body.UserNameToUnblock;
  User.findOne({ userName: blockedUserName })
    .then((user) => {
      if (!user) {
        console.error("User not found for username:", blockedUserName);
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
          console.error("Error unblocking user:", err);
          res.status(500).json({ message: "Server error" });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Server error" });
    });
};

const editFeedSettings = (req, res, next) => {
  const userId = req.userId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
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
      user
        .save()
        .then((user) => {
          console.log("Feed settings updated: ", user);
          res.json({
            message: "User Feed settings updated successfully",
            user: user,
          });
        })
        .catch((err) => {
          console.error("Error updating Feed settings:", err);
          res.status(500).json({ message: "Server error" });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Server error" });
    });
};

const viewFeedSettings = (req, res, next) => {
  const userId = req.userId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
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
    })
    .catch((err) => {
      console.error("Error retrieving feed settings:", err);
      res.status(500).json({ message: "Server error" });
    });
};

const addSocialLink = (req, res, next) => {
  const userId = req.userId;
  const { linkOrUsername, appName, logo, displayText } = req.body;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      if (user.socialLinks.length >= 5) {
        console.error("User has reached the maximum number of social links");
        return res
          .status(400)
          .json({ message: "Maximum number of social links reached" });
      }
      user.socialLinks.push({ linkOrUsername, appName, logo, displayText });
      user
        .save()
        .then((updatedUser) => {
          console.log("Social link added: ", updatedUser);
          res.json({
            message: "Social link added successfully",
            user: updatedUser,
          });
        })
        .catch((err) => {
          console.error("Error adding social link:", err);
          res
            .status(500)
            .json({ message: "Error adding social link to user", error: err });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Server error" });
    });
};
const editSocialLink = (req, res, next) => {
  const userId = req.userId;
  const { linkId, linkOrUsername, appName, logo, displayText } = req.body;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      socialLinkToUpdate = user.socialLinks.find((link) => link._id == linkId);
      if (!socialLinkToUpdate) {
        console.error("Social link not found for link ID:", linkId);
        return res.status(404).json({ message: "Social link not found" });
      }
      socialLinkToUpdate.linkOrUsername = linkOrUsername;
      socialLinkToUpdate.appName = appName;
      socialLinkToUpdate.logo = logo;
      socialLinkToUpdate.displayText = displayText;
      user
        .save()
        .then((updatedUser) => {
          console.log("Social link updated: ", updatedUser);
          res.json({
            message: "Social link updated successfully",
            user: updatedUser,
          });
        })
        .catch((err) => {
          console.error("Error updating social link:", err);
          res.status(500).json({
            message: "Error updating social link for user",
            error: err,
          });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Error Retrieving User", error: err });
    });
};
const deleteSocialLink = (req, res, next) => {
  const userId = req.userId;
  const linkId = req.body.socialLinkId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      socialLinkToDelete = user.socialLinks.find((link) => link._id == linkId);
      if (!socialLinkToDelete) {
        console.error("Social link not found for link ID:", linkId);
        return res.status(404).json({ message: "Social link not found" });
      }
      user.socialLinks.pull(socialLinkToDelete);
      user
        .save()
        .then((updatedUser) => {
          console.log("Social link deleted: ", updatedUser);
          res.json({
            message: "Social link deleted successfully",
            user: updatedUser,
          });
        })
        .catch((err) => {
          console.error("Error deleting social link:", err);
          res.status(500).json({
            message: "Error deleting social link from user",
            error: err,
          });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Error Retrieving User", error: err });
    });
};

const updateGender = (req, res, next) => {
  const userId = req.userId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      if (user.gender === req.body.gender) {
        return res
          .status(400)
          .json({ message: "Gender is already set to this value" });
      }
      user.gender = req.body.gender;
      user
        .save()
        .then((updatedUser) => {
          res.status(200).json({
            message: "User gender updated successfully",
            user: updatedUser,
          });
        })
        .catch((err) => {
          return res.status(500).json({
            message: "Failed to update User Gender",
            error: err,
          });
        });
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ message: "ERROR Retrieving user", error: err });
    });
};

const muteCommunity = (req, res, next) => {
  const userId = req.userId;
  const communityId = req.body.subRedditId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      subReddit
        .findById(communityId)
        .then((community) => {
          if (!community) {
            return res.status(404).json({ message: "Community not found" });
          }
          if (user.muteCommunities.includes(communityId)) {
            return res.status(400).json({ message: "Community already muted" });
          }
          user.muteCommunities.push(communityId);
          user
            .save()
            .then((updatedUser) => {
              console.log("Community muted: ", updatedUser);
              res.json({
                message: "Community muted successfully",
                user: updatedUser,
              });
            })
            .catch((err) => {
              console.error("Error muting community:", err);
              res.status(500).json({
                message: "Error muting community for user",
                error: err,
              });
            });
        })
        .catch((err) => {
          console.error("Error retrieving community:", err);
          res.status(500).json({ message: "Error retrieving community:" });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Error retrieving user:" });
    });
};

const unmuteCommunity = (req, res, next) => {
  const userId = req.userId;
  const communityId = req.body.subRedditId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      subReddit
        .findById(communityId)
        .then((community) => {
          if (!community) {
            console.error("Community not found for community ID:", communityId);
            return res.status(404).json({ message: "Community not found" });
          }
          const unmute = user.muteCommunities.find((muteCommunity) =>
            muteCommunity.equals(communityId)
          );
          if (!unmute) {
            console.error("This subReddit is not muted for you:", communityId);
            return res
              .status(404)
              .json({ message: "This subReddit is not muted for you" });
          }
          user.muteCommunities.pull(communityId);
          user
            .save()
            .then((updatedUser) => {
              console.log("Community unmuted: ", updatedUser);
              res.json({
                message: "Community unmuted successfully",
                user: updatedUser,
              });
            })
            .catch((err) => {
              console.error("Error unmuting community:", err);
              res.status(500).json({
                message: "Error unmuting community for user",
                error: err,
              });
            });
        })
        .catch((err) => {
          console.error("Error retrieving community:", err);
          res.status(500).json({ message: "Server error" });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Server error" });
    });
};

const joinCommunity = (req, res, next) => {
  const userId = req.userId;
  const communityId = req.body.subRedditId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      SubReddit.findById(communityId)
        .then((community) => {
          if (!community) {
            console.error("Community not found for community ID:", communityId);
            return res.status(404).json({ message: "Community not found" });
          }
          if (user.communities.includes(communityId)) {
            return res
              .status(400)
              .json({ message: "Community already joined" });
          }
          if (
            community.privacy === "private" ||
            community.privacy === "Private"
          ) {
            if (community.pendingMembers.includes(userId)) {
              return res
                .status(400)
                .json({ message: "User already requested to join community" });
            }
            community.pendingMembers.push(userId);
          } else if (
            community.privacy === "restricted" ||
            community.privacy === "public" ||
            community.privacy === "Restricted" ||
            community.privacy === "Public"
          ) {
            if (community.members.includes(userId)) {
              return res
                .status(400)
                .json({ message: "User already in this community" });
            }
            community.members.push(userId);
          }
          community
            .save()
            .then((updatedCommunity) => {
              if (
                community.privacy === "private" ||
                community.privacy === "Private"
              ) {
                console.log(
                  "User requested to join community: ",
                  updatedCommunity
                );
                res.json({
                  message: "User requested to join community",
                  community: updatedCommunity,
                });
              } else {
                console.log("User joined community: ", updatedCommunity);
                res.json({
                  message: "User joined community",
                  community: updatedCommunity,
                });

                // Save the user after sending the response
                user.communities.push(communityId);
                user
                  .save()
                  .then((updatedUser) => {
                    console.log("Community joined: ", updatedUser);
                  })
                  .catch((err) => {
                    console.error("Error updating user:", err);
                  });
              }
            })
            .catch((err) => {
              console.error("Error updating community:", err);
              res
                .status(500)
                .json({ message: "Error updating community", error: err });
            });
        })
        .catch((err) => {
          console.error("Error retrieving community:", err);
          res.status(500).json({ message: "Server error" });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Server error" });
    });
};

const unjoinCommunity = (req, res) => {
  const userId = req.userId;
  const communityId = req.body.subRedditId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      SubReddit.findById(communityId)
        .then((community) => {
          if (!community) {
            console.error("Community not found for community ID:", communityId);
            return res.status(404).json({ message: "Community not found" });
          }
          if (
            community.privacy === "private" ||
            community.privacy === "Private"
          ) {
            if (
              !community.pendingMembers.includes(userId) &&
              !community.members.includes(userId)
            ) {
              return res.status(400).json({
                message: "User is not pending or a member of this community",
              });
            }
            if (community.pendingMembers.includes(userId)) {
              community.pendingMembers.pull(userId);
            }
            if (community.members.includes(userId)) {
              community.members.pull(userId);
            }
          } else if (
            community.privacy === "restricted" ||
            community.privacy === "public" ||
            community.privacy === "Restricted" ||
            community.privacy === "Public"
          ) {
            if (!community.members.includes(userId)) {
              return res
                .status(400)
                .json({ message: "User is not a member of this community" });
            }
            community.members.pull(userId);
          }
          community
            .save()
            .then((updatedCommunity) => {
              console.log("User unjoined community: ", updatedCommunity);
              res.json({
                message: "User unjoined community",
                community: updatedCommunity,
              });

              // Remove the community from the user after sending the response
              user.communities.pull(communityId);
              user
                .save()
                .then((updatedUser) => {
                  console.log("Community unjoined: ", updatedUser);
                })
                .catch((err) => {
                  console.error("Error updating user:", err);
                });
            })
            .catch((err) => {
              console.error("Error updating community:", err);
              res
                .status(500)
                .json({ message: "Error updating community", error: err });
            });
        })
        .catch((err) => {
          console.error("Error retrieving community:", err);
          res.status(500).json({ message: "Server error" });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Server error" });
    });
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
};
