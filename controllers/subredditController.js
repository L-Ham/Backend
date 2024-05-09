const SubReddit = require("../models/subReddit");
const User = require("../models/user");
const Post = require("../models/post");
const subredditServices = require("../services/subredditServices");
const UserUploadModel = require("../models/userUploads");
const UserUpload = require("../controllers/userUploadsController");
const UserServices = require("../services/userServices");
const PostServices = require("../services/postServices");
const subReddit = require("../models/subReddit");
const notification = require("../models/notification");

const checkCommunitynameExists = (Communityname) => {
  return SubReddit.findOne({ name: Communityname });
};

// const sorting = async (req, res, next) => {
//   const { subredditName, Best, New, Top, Rising } = req.query;

//   try {
//     const subreddit = await SubReddit.findOne({ name: subredditName });
//     if (!subreddit || !subreddit.posts) {
//       return res.status(404).json({ message: "Subreddit not found" });
//     }

//     let sortedPosts = subreddit.posts;
//     if (Best) {
//       sortedPosts.sort((a, b) => b.votes - a.votes);
//     } else if (New) {
//       sortedPosts.sort((a, b) => b.createdAt - a.createdAt);
//     } else if (Top) {
//       sortedPosts.sort(
//         (a, b) => (b.votes + b.comments.length) - (a.votes + a.comments.length)
//       );
//     } else if (Rising) {
//       sortedPosts.sort(() => Math.random() - 0.5);
//     }

//     const postImagesIds = sortedPosts.Map((post) => post.images);
//     const subRedditIds = sortedPosts.map((post) => post.subReddit);

//     const Images = await UserUploadModel.find({ _id: { $in: postImagesIds } });

//     const formattedPosts = await Promise.all(
//       sortedPosts.map(async (post) => {
//         const postImages = (post.images || []).map(imageId => {
//           const image = Images.find((img) => img._id.equals(imageId));
//           return image ? image.url : null;
//         });
//         const subRedditTemp = subReddits.find((community) =>
//           community._id.equals(post.subReddit)
//         );
//         const avatarImageId = subRedditTemp && subRedditTemp.appearance ? subRedditTemp.appearance.avatarImage : null;
//         const avatarImage = avatarImageId
//           ? await UserUploadModel.findById(avatarImageId)
//           : null;

//         return {
//           postId: post._id,
//           title: post.title,
//           text: post.text,
//           images: postImages,
//           subreddit: subRedditTemp ? subRedditTemp.name : null,
//           subRedditId: subRedditTemp ? subRedditTemp._id : null,
//           avatarImage: avatarImage ? avatarImage.url : null,
//           upvotes: post.upvotes,
//           downvotes: post.downvotes,
//           isLocked: post.isLocked,
//           isSpoiler: post.isSpoiler,
//           isNSFW: post.isNSFW,
//           commentCount: post.commentCount,
//           poll: post.poll,
//           url: post.url,
//           createdAt: post.createdAt,
//         };
//       })
//     );

//     res.json(formattedPosts);
//   } catch (error) {
//     res.status(500).json({ message: "Error sorting posts", error: error.message });
//   }
// };
const createCommunity = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const existingCommunity = await checkCommunitynameExists(req.body.name);
    if (existingCommunity) {
      return res.status(400).json({ message: "Community name already exists" });
    }

    if (req.body.name === "") {
      return res.status(400).json({ message: "Community name is required" });
    }

    const newCommunity = new SubReddit({
      name: req.body.name,
      privacy: req.body.privacy,
      ageRestriction: req.body.ageRestriction,
      moderators: [user._id],
      members: [user._id],
      membersNickname: "Members",
      currentlyViewingNickname: "Online",
      communityDescription: "",
      appearance: {
        avatarImage: null,
        bannerImage: null,
        keyColor: {
          hue: 0,
          saturation: 0,
          hexCode: "",
        },
        baseColor: {
          hue: 0,
          saturation: 0,
          hexCode: "",
        },
        stickyPostColor: {
          hue: 0,
          saturation: 0,
          hexCode: "",
        },
      },
    });
    const savedCommunity = await newCommunity.save();
    console.log(savedCommunity);
    user.communities.push(savedCommunity._id);
    user.moderates.push(savedCommunity._id);
    const savedUser = await user.save();

    res.json({
      message: "Created community successfully",
      savedCommunity,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create community", error: err.message });
  }
};

const addRule = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  const { rule, description, appliedTo, reportReason, descriptionHtml } =
    req.body;

  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    if (!subredditServices.checkWidgetsSize(subreddit)) {
      return res.status(400).json({ message: "Maximum 20 widgets allowed" });
    }
    if (!subredditServices.checkRulesSize(subreddit)) {
      return res.status(400).json({ message: "Maximum 15 rules allowed" });
    }

    subreddit.rules.ruleList.push({
      ruleText: rule,
      fullDescription: description,
      appliesTo: appliedTo,
      reportReason: reportReason,
      descriptionHtml: descriptionHtml,
    });
    if (subreddit.rules.ruleList.length == 1) {
      subreddit.orderWidget.push(subreddit.rules._id);
    }
    const savedSubreddit = await subreddit.save();
    res.json({
      message: "Rule added successfully",
      savedSubreddit,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding rule" });
  }
};

const editRule = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  const ruleId = req.body.ruleId;
  const { rule, description, appliedTo, reportReason, descriptionHtml } =
    req.body;
  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    if (!ruleId) {
      return res.status(404).json({ message: "Rule ID is required" });
    }
    const ruleIndex = subreddit.rules.ruleList.findIndex(
      (rule) => rule._id.toString() === ruleId
    );
    if (ruleIndex === -1) {
      return res.status(404).json({ message: "Rule not found" });
    }
    subreddit.rules.ruleList[ruleIndex].ruleText = rule;
    subreddit.rules.ruleList[ruleIndex].fullDescription = description;
    subreddit.rules.ruleList[ruleIndex].appliesTo = appliedTo;
    subreddit.rules.ruleList[ruleIndex].reportReason = reportReason;
    subreddit.rules.ruleList[ruleIndex].descriptionHtml = descriptionHtml;

    const savedSubreddit = await subreddit.save();
    res.json({
      message: "Rule edited successfully",
      rules: subreddit.rules,
    });
  } catch (error) {
    res.status(500).json({ message: "Error editing rule" });
  }
};
const deleteRule = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  const ruleId = req.body.ruleId;
  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    if (!ruleId) {
      return res.status(404).json({ message: "Rule ID is required" });
    }
    const ruleIndex = subreddit.rules.ruleList.findIndex(
      (rule) => rule._id.toString() === ruleId
    );
    if (ruleIndex === -1) {
      return res.status(404).json({ message: "Rule not found" });
    }
    subreddit.rules.ruleList.splice(ruleIndex, 1);
    await subreddit.save();
    res.json({
      message: "Rule deleted successfully",
      rules: subreddit.rules,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting rule" });
  }
};

const addTextWidget = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  const { widgetName, text, textHtml, shortName } = req.body;

  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    if (!subredditServices.checkWidgetsSize(subreddit)) {
      return res.status(400).json({ message: "Maximum 20 widgets allowed" });
    }

    subreddit.textWidgets.push({
      widgetName,
      text,
      textHtml,
      shortName,
    });

    subreddit.orderWidget.push(
      subreddit.textWidgets[subreddit.textWidgets.length - 1]._id
    );
    const savedSubreddit = await subreddit.save();

    res.json({
      message: "Text widget added successfully",
      savedSubreddit,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding text widget" });
  }
};
const editTextWidget = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  const textWidgetId = req.body.textWidgetId;
  const { widgetName, text, textHtml, shortName } = req.body;

  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    if (!textWidgetId) {
      return res.status(404).json({ message: "Text widget ID is required" });
    }

    const textWidget = subreddit.textWidgets.id(textWidgetId);
    if (!textWidget) {
      return res
        .status(404)
        .json({ message: "Text widget with provided ID not found" });
    }
    textWidget.widgetName = widgetName;
    textWidget.text = text;
    textWidget.textHtml = textHtml;
    textWidget.shortName = shortName;
    const savedSubreddit = await subreddit.save();
    res.status(200).json({
      message: "Text widget edited successfully",
      widgets: subreddit.textWidgets,
    });
  } catch (error) {
    res.status(500).json({ message: "Error editing text widget" });
  }
};
const deleteTextWidget = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  const textWidgetId = req.body.textWidgetId;

  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    if (!textWidgetId) {
      return res.status(404).json({ message: "Text widget ID is required" });
    }

    const textWidgetIndex = subreddit.textWidgets.findIndex(
      (widget) => widget._id.toString() === textWidgetId
    );

    if (textWidgetIndex === -1) {
      return res.status(404).json({ message: "Text widget not found" });
    }

    subreddit.textWidgets.splice(textWidgetIndex, 1);

    await subreddit.save();

    res.json({
      message: "Text widget deleted successfully",
      widgets: subreddit.textWidgets,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting text widget", error: error.message });
  }
};
const reorderRules = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  const rulesOrder = req.body.rulesOrder;

  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }

    const rules = subreddit.rules.ruleList;

    if (rulesOrder.length !== rules.length) {
      return res.status(400).json({
        message:
          "The number of rules provided does not match the number of existing rules",
      });
    }

    if (new Set(rulesOrder).size !== rulesOrder.length) {
      return res.status(400).json({ message: "Duplicate rule IDs provided" });
    }

    const ruleMap = new Map(rules.map((rule) => [rule._id.toString(), rule]));

    if (!rulesOrder.every((ruleId) => ruleMap.has(ruleId))) {
      return res
        .status(400)
        .json({ message: "One or more rule IDs provided do not exist" });
    }

    const reorderedRules = rulesOrder.map((ruleId) => ruleMap.get(ruleId));

    subreddit.rules.ruleList = reorderedRules;

    const savedSubreddit = await subreddit.save();

    res.json({
      message: "Rules reordered successfully",
      rules: savedSubreddit.rules.ruleList,
    });
  } catch (error) {
    res.status(500).json({ message: "Error reordering rules" });
  }
};

const getSubredditPosts = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.query.subredditId;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const subreddit = await SubReddit.findById(subredditId);
  if (!subreddit) {
    return res.status(404).json({ message: "Subreddit not found" });
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};

  if (endIndex < (await model.countDocuments().exec())) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }
  try {
    results.results = await model.find().limit(limit).skip(startIndex).exec();
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error Getting Subreddit Posts", error: err.message });
  }
};
const getCommunityDetails = async (req, res) => {
  const userId = req.userId;
  const subRedditName = req.query.subRedditName;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findOne({ name: subRedditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    const avatarImage = await UserUploadModel.findById(
      subreddit.appearance.avatarImage
    );
    const bannerImage = await UserUploadModel.findById(
      subreddit.appearance.bannerImage
    );
    const createdSeconds = Math.floor(subreddit.createdAt.getTime() / 1000);
    const randomIndex = Math.floor(Math.random() * subreddit.members.length);
    const isFavorite = user.favoriteCommunities.includes(subreddit._id);
    //const isMuted = user.muteCommunities.mutedCommunityId.includes(subreddit._id);
    const isMuted = await User.findOne({
      _id: userId,
      "muteCommunities.mutedCommunityId": subreddit._id,
    });
    const details = {
      name: subreddit.name,
      subredditId: subreddit._id,
      avatarImage: avatarImage ? avatarImage.url : null,
      bannerImage: bannerImage ? bannerImage.url : null,
      description: subreddit.description,
      membersNickname: subreddit.membersNickname,
      membersCount: subreddit.members.length,
      currentlyViewingNickname: subreddit.currentlyViewingNickname,
      currentlyViewingCount: randomIndex,
      isMember: subreddit.members.includes(userId),
      isModerator: subreddit.moderators.includes(userId),
      notificationLevelAttribute: "frequent",
      isFavorite: isFavorite,
      isMuted: isMuted ? true : false,
      createdAt: createdSeconds,
    };

    res.status(200).json({
      message: "Subreddit's Community Details Retrieved Successfully",
      communityDetails: details,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error Getting Community Details", error: err.message });
  }
};
const editCommunityDetails = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res
        .status(500)
        .json({ message: "User is not a moderator to this subreddit" });
    }
    subreddit.description = req.body.communityDescription;
    subreddit.currentlyViewingNickname = req.body.currentlyViewingNickname;
    subreddit.membersNickname = req.body.membersNickname;

    await subreddit.save();
    res.status(200).json({
      message: "Subreddit's Community Details Edited Successfully",
      subreddit: subreddit,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error Editing Community Details", err: err.message });
  }
};
const getSubRedditRules = async (req, res, next) => {
  const subredditId = req.query.subredditId;
  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    res.json({
      message: "Subreddit rules retrieved successfully",
      rules: subreddit.rules,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting subreddit rules", error: error.message });
  }
};

const uploadAvatarImage = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "subreddit not found" });
    }

    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "User not a moderator" });
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

    subreddit.appearance.avatarImage = uploadedImageId;

    await subreddit.save();

    res.status(200).json({ message: "Avatar image uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error uploading avatar image" });
  }
};

const getAvatarImage = async (req, res, next) => {
  try {
    const subredditId = req.query.subredditId;
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }

    const avatarImageId = subreddit.appearance.avatarImage;
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
    res.status(500).json({ message: "Error getting subreddit avatar image" });
  }
};
const uploadBannerImage = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "subreddit not found" });
    }

    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "User not a moderator" });
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

    subreddit.appearance.bannerImage = uploadedImageId;
    await subreddit.save();
    res.status(200).json({ message: "Banner image uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error uploading banner image" });
  }
};
const getBannerImage = async (req, res, next) => {
  try {
    const subredditId = req.query.subredditId;
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }

    const bannerImageId = subreddit.appearance.bannerImage;
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
    res.status(500).json({ message: "Error getting subreddit banner image" });
  }
};

const getSubredditByNames = async (req, res) => {
  try {
    const { search } = req.query;
    // const userId = req.userId;
    // const user = await User.findById(userId);
    const regex = new RegExp(`^${search}`, "i");
    const matchingNames = await SubReddit.find(
      { name: regex },
      "_id name appearance.avatarImage members ageRestriction description"
    );

    const avatarImagePromises = matchingNames.map(async (subreddit) => {
      const currentlyViewingCount =
        Math.floor(Math.random() * subreddit.members.length) + 1;
      const membersCount = subreddit.members.length;
      const avatarImageId = subreddit.appearance.avatarImage;
      const avatarImage = avatarImageId
        ? await UserUploadModel.findById(avatarImageId)
        : null;

      return {
        ...subreddit._doc,
        currentlyViewingCount,
        membersCount,
        appearance: {
          ...subreddit.appearance,
          avatarImage: avatarImage,
        },
        isNSFW: subreddit.ageRestriction,
      };
    });

    const resultsWithRandomNumber = await Promise.all(avatarImagePromises);

    res.json({ matchingNames: resultsWithRandomNumber });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error searching Subreddit Names", error: err.message });
  }
};

const getSubredditRules = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    res.json({
      message: "Subreddit rules retrieved successfully",
      rules: subreddit.rules,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting subreddit rules", error: error.message });
  }
};
const getWidget = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.query.subredditId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }

    const moderators = await Promise.all(
      subreddit.moderators.map(async (moderatorId) => {
        const moderator = await User.findById(moderatorId);
        const moderatorAvatarImage = await UserUploadModel.findById(
          moderator.avatarImage
        );
        return {
          username: moderator.userName,
          avatarImage: moderatorAvatarImage ? moderatorAvatarImage.url : null,
        };
      })
    );
    const avatarImage = await UserUploadModel.findById(
      subreddit.appearance.avatarImage
    );
    const bannerImage = await UserUploadModel.findById(
      subreddit.appearance.bannerImage
    );
    const createdSeconds = Math.floor(subreddit.createdAt.getTime() / 1000);
    const randomIndex = Math.floor(Math.random() * subreddit.members.length);
    const communityDetails = {
      name: subreddit.name,
      subredditId: subreddit._id,
      avatarImage: avatarImage ? avatarImage.url : null,
      bannerImage: bannerImage ? bannerImage.url : null,
      description: subreddit.description,
      membersNickname: subreddit.membersNickname,
      membersCount: subreddit.members.length,
      currentlyViewingNickname: subreddit.currentlyViewingNickname,
      currentlyViewingCount: randomIndex,
      isMember: subreddit.members.includes(userId),
      createdAt: createdSeconds,
    };
    const textWidgetsById = subreddit.textWidgets.reduce((acc, widget) => {
      acc[widget._id] = widget;
      return acc;
    }, {});
    const bookMarksById = subreddit.bookMarks.reduce((acc, bookmark) => {
      acc[bookmark._id] = bookmark;
      return acc;
    }, {});

    let response = {
      message: "Subreddit widgets retrieved successfully",
      communityDetails,
      textWidgets: textWidgetsById,
      bookMarks: bookMarksById,
      moderators,
      rules: subreddit.rules,
      orderWidget: subreddit.orderWidget,
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      message: "Error getting subreddit widgets",
      error: error.message,
    });
  }
};
const getPopularCommunities = async (req, res) => {
  try {
    const popularCommunities = await SubReddit.find()
      .sort({ "members.length": -1 })
      .limit(20);

    const avatarImages = await UserUploadModel.find({
      _id: {
        $in: popularCommunities.map(
          (community) => community.appearance.avatarImage
        ),
      },
    });

    const formattedCommunities = popularCommunities.map((community) => {
      const memberCount = community.members.length;
      const avatarImage = avatarImages.find((image) =>
        image._id.equals(community.appearance.avatarImage)
      );
      return {
        name: community.name,
        communityId: community._id,
        avatarImageUrl: avatarImage ? avatarImage.url : null,
        memberCount: memberCount,
        description: community.description,
      };
    });

    const sortedCommunities = formattedCommunities.sort(
      (a, b) => b.memberCount - a.memberCount
    );

    res.json({ popularCommunities: sortedCommunities });
  } catch (error) {
    res.status(500).json({ message: "Error getting popular communities" });
  }
};

const checkSubredditNameAvailability = async (req, res, next) => {
  try {
    const name = req.query.name;

    if (!name) {
      return res.status(400).json({ message: "Name is empty" });
    }

    const subReddit = await SubReddit.findOne({ name: name });

    if (subReddit) {
      return res.status(400).json({ message: "Name already taken" });
    }
    res.json({ message: "Name available" });
  } catch (err) {
    if (res.status) {
      res.status(500).json({ message: "Server error" });
    } else {
      next(err);
    }
  }
};

const getSubredditModerators = async (req, res, next) => {
  const subredditName = req.query.subredditName;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    const moderators = await User.find({ _id: { $in: subreddit.moderators } });
    const moderatorDetails = await Promise.all(
      moderators.map(async (moderator) => {
        const userUpload = await UserUploadModel.findOne({
          _id: moderator.avatarImage,
        });
        return {
          _id: moderator._id,
          userName: moderator.userName,
          avatarImage: userUpload ? userUpload.url : null,
        };
      })
    );

    res.json({
      message: "Retrieved subreddit moderators Successfully",
      moderators: moderatorDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error getting subreddit moderators",
      error: error.message,
    });
  }
};

const getSubredditMembers = async (req, res, next) => {
  const subredditName = req.query.subredditName;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    const members = await User.find({ _id: { $in: subreddit.members } });
    const membersDetails = await Promise.all(
      members.map(async (member) => {
        const userUpload = await UserUploadModel.findOne({
          _id: member.avatarImage,
        });
        console.log(userUpload);
        return {
          _id: member._id,
          userName: member.userName,
          avatarImage: userUpload ? userUpload.url : null,
        };
      })
    );

    res.json({
      message: "Retrieved subreddit Approved Users Successfully",
      approvedMembers: membersDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error getting subreddit Members",
      error: error.message,
    });
  }
};

const getPendingMembers = async (req, res, next) => {
  const subredditName = req.query.subredditName;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    const members = await User.find({ _id: { $in: subreddit.pendingMembers } });
    const membersDetails = await Promise.all(
      members.map(async (member) => {
        const userUpload = await UserUploadModel.findOne({
          _id: member.avatarImage,
        });
        return {
          _id: member._id,
          userName: member.userName,
          avatarImage: userUpload ? userUpload.url : null,
        };
      })
    );

    res.json({
      message: "Retrieved subreddit Pending Users Successfully",
      pendingMembers: membersDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error getting subreddit Members",
      error: error.message,
    });
  }
};
const suggestSubreddit = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // const userSubreddits = user.subreddits.map((subreddit) => subreddit._id);
    const subredditsNotJoined = await SubReddit.find({
      _id: { $nin: user.communities },
    });
    if (subredditsNotJoined.length > 0) {
      const randomSubreddit =
        subredditsNotJoined[
        Math.floor(Math.random() * subredditsNotJoined.length)
        ];
      const avatarImage = await UserUploadModel.findById(
        randomSubreddit.appearance.avatarImage
      );
      const bannerImage = await UserUploadModel.findById(
        randomSubreddit.appearance.bannerImage
      );
      const suggestedSubreddit = {
        name: randomSubreddit.name,
        avatarImage: avatarImage ? avatarImage.url : null,
        bannerImage: bannerImage ? bannerImage.url : null,
      };
      res.status(200).json({
        message: "Suggesting a Subreddit",
        suggestedSubreddit: suggestedSubreddit,
      });
    } else {
      res.status(404).json({ message: "No subreddits Found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error Suggesting a Subreddit", error: error.message });
  }
};

const getTrendingCommunities = async (req, res) => {
  try {
    const TrendingCommunities = await SubReddit.find()
      .sort({ "posts.length": -1 })
      .limit(20);

    const avatarImages = await UserUploadModel.find({
      _id: {
        $in: TrendingCommunities.map(
          (community) => community.appearance.avatarImage
        ),
      },
    });

    const formattedCommunities = TrendingCommunities.map((community) => {
      const postCount = community.posts.length;
      const memberCount = community.members.length;
      const avatarImage = avatarImages.find((image) =>
        image._id.equals(community.appearance.avatarImage)
      );
      return {
        name: community.name,
        communityId: community._id,
        avatarImageUrl: avatarImage ? avatarImage.url : null,
        memberCount: memberCount,
        postCount: postCount,
        description: community.description,
      };
    });

    const sortedCommunities = formattedCommunities.sort(
      (a, b) => b.postCount - a.postCount
    );

    res.json({ TrendingCommunities: sortedCommunities });
  } catch (error) {
    res.status(500).json({ message: "Error getting Trending communities" });
  }
};

const approveUser = async (req, res, next) => {
  const userId = req.userId;
  const subredditName = req.body.subredditName;
  const userName = req.body.userName;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (subreddit.privacy !== "private" && subreddit.privacy !== "Private") {
      return res
        .status(400)
        .json({ message: "Subreddit is not private Anyone Can Join" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    const user = await User.findOne({ userName: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (subreddit.members.includes(user._id)) {
      return res.status(400).json({ message: "User already a member" });
    }
    if (!subreddit.pendingMembers.includes(user._id)) {
      return res.status(400).json({ message: "User not in pending members" });
    }
    subreddit.pendingMembers.pop(user._id);
    subreddit.members.push(user._id);
    user.communities.push(subreddit._id);
    await subreddit.save();
    await user.save();
    res.json({ message: "User approved successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving user", error: error.message });
  }
};
const forceApproveUser = async (req, res, next) => {
  const userId = req.userId;
  const subredditName = req.body.subredditName;
  const userName = req.body.userName;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    const user = await User.findOne({ userName: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (subreddit.members.includes(user._id)) {
      return res.status(400).json({ message: "User already a member" });
    }

    subreddit.members.push(user._id);
    user.communities.push(subreddit._id);
    await subreddit.save();
    await user.save();

    res.json({ message: "User approved successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving user", error: error.message });
  }
};

const UnapproveUser = async (req, res, next) => {
  const userId = req.userId;
  const subredditName = req.body.subredditName;
  const userName = req.body.userName;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (subreddit.privacy !== "private" && subreddit.privacy !== "Private") {
      return res
        .status(400)
        .json({ message: "Subreddit is not private Anyone Can Join" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    const user = await User.findOne({ userName: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!subreddit.pendingMembers.includes(user._id)) {
      return res.status(400).json({ message: "User not in pending members" });
    }
    subreddit.pendingMembers.pull(user._id);
    user.communities.pull(subreddit._id);
    await subreddit.save();
    await user.save();
    res.json({ message: "User unapproved successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error unapproving user", error: error.message });
  }
};

const removeSubredditMember = async (req, res, next) => {
  const username = req.body.userName;
  const subredditName = req.body.subredditName;
  const userId = req.userId;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    const user = await User.findOne({ userName: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!subreddit.members.includes(user._id)) {
      return res.status(400).json({ message: "User not a member" });
    }
    subreddit.members = subreddit.members.filter(
      (member) => member.toString() !== user._id.toString()
    );
    if (!subreddit.removedUsers) {
      subreddit.removedUsers = [];
    }
    subreddit.removedUsers.push({
      user: {
        _id: user._id,
        userName: user.userName,
      },
    });
    user.communities = user.communities.filter(
      (community) => community.toString() !== subreddit._id.toString()
    );

    await subreddit.save();
    await user.save();
    res.json({ message: "Subreddit member removed successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error removing subreddit member",
      error: error.message,
    });
  }
};

const getBannedUsers = async (req, res, next) => {
  const userId = req.userId;
  const subredditName = req.query.subredditName;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    const bannedUsersIds = subreddit.bannedUsers.map(
      (bannedUser) => bannedUser.userId
    );
    const bannedUsers = await User.find({ _id: { $in: bannedUsersIds } });
    const bannedUsersDetails = await Promise.all(
      bannedUsers.map(async (bannedUser) => {
        const userUpload = await UserUploadModel.findOne({
          _id: bannedUser.avatarImage,
        });
        const bannedUserDetails = subreddit.bannedUsers.find(
          (bannedUserDetails) =>
            bannedUserDetails.userId.toString() === bannedUser._id.toString()
        );
        return {
          _id: bannedUser._id,
          userName: bannedUser.userName,
          avatarImage: userUpload ? userUpload.url : null,
          bannedAt: bannedUserDetails ? bannedUserDetails.bannedAt : null,
          permanent: bannedUserDetails ? bannedUserDetails.permanent : null,
          reasonForBan: bannedUserDetails
            ? bannedUserDetails.reasonForBan
            : null,
          modNote: bannedUserDetails ? bannedUserDetails.modNote : null,
        };
      })
    );

    res.json({
      message: "Retrieved subreddit Banned Users Successfully",
      bannedUsers: bannedUsersDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error getting subreddit Banned Users",
      error: error.message,
    });
  }
};

const banUser = async (req, res, next) => {
  const userId = req.userId;
  const subredditName = req.body.subredditName;
  const userName = req.body.userName;
  const reasonForBan = req.body.reasonForBan;
  const modNote = req.body.modNote;
  const permanent = req.body.permanent;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    const user = await User.findOne({ userName: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (
      !user.communities.includes(subreddit._id.toString()) &&
      !subreddit.bannedUsers.some((bannedUser) =>
        bannedUser.userId.equals(user._id)
      )
    ) {
      return res
        .status(400)
        .json({ message: "User is not a member of this subreddit" });
    }
    if (user._id.toString() === userId.toString()) {
      return res.status(400).json({ message: "You can't ban yourself" });
    }
    if (
      subreddit.bannedUsers.some((bannedUser) =>
        bannedUser.userId.equals(user._id)
      )
    ) {
      const bannedUser = subreddit.bannedUsers.find((bannedUser) =>
        bannedUser.userId.equals(user._id)
      );
      if (bannedUser) {
        bannedUser.modNote = modNote;
        bannedUser.reasonForBan = reasonForBan;
        await subreddit.save();
        return res.json({ message: "Banned user updated successfully" });
      }
    }
    subreddit.bannedUsers.push({
      userId: user._id,
      userName: user.userName,
      permanent: permanent,
      reasonForBan: reasonForBan,
      bannedAt: new Date(),
      modNote: modNote,
    });
    await subreddit.save();
    user.bannedSubreddits.push(subreddit._id);
    await user.save();

    res.json({ message: "User banned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error banning user" });
  }
};

const unbanUser = async (req, res, next) => {
  const userId = req.userId;
  const subredditName = req.body.subredditName;
  const userName = req.body.userName;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    const user = await User.findOne({ userName: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (
      !subreddit.bannedUsers.find(
        (bannedUser) => bannedUser.userId.toString() === user._id.toString()
      )
    ) {
      return res.status(400).json({ message: "User not banned" });
    }
    subreddit.bannedUsers = subreddit.bannedUsers.filter(
      (bannedUser) => bannedUser.userId.toString() !== user._id.toString()
    );
    await subreddit.save();
    user.bannedSubreddits = user.bannedSubreddits.filter(
      (bannedSubreddit) =>
        bannedSubreddit.toString() !== subreddit._id.toString()
    );
    await user.save();

    res.json({ message: "User unbanned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error unbanning user" });
  }
};

const getSubredditFeed = async (req, res) => {
  const userId = req.userId;
  const subredditName = req.query.subredditName;
  const sortMethod = req.query.sort;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    let user;
    if (userId) {
      user = await User.findById(userId);
    }
    const query = Post.find({
      subReddit: subreddit._id,
      _id: { $nin: subreddit.removedPosts },
    });
    const result = await PostServices.paginatePosts(
      query,
      page,
      limit,
      sortMethod
    );
    if (result.slicedArray.length == 0) {
      return res.status(500).json({ message: "The retrieved array is empty" });
    }
    // console.log(result.slicedArray);
    const postsWithVoteStatus = await Promise.all(
      result.slicedArray.map(async (post) => {
        let subreddit = null;
        if (post.subReddit) {
          subreddit = await SubReddit.findById(post.subReddit);
        }
        const subredditName = subreddit ? subreddit.name : null;
        const isUpvoted = !userId
          ? false
          : post.upvotedUsers.includes(user._id);
        const isDownvoted = !userId
          ? false
          : post.downvotedUsers.includes(user._id);
        const isSaved = !userId ? false : user.savedPosts.includes(post._id);
        const creator = await User.findById(post.user);
        const creatorUsername = creator.userName;
        const creatorAvatarImage = await UserUploadModel.findById(
          creator.avatarImage
        );

        let imageUrls, videoUrls;
        if (post.type === "image") {
          imageUrls = await PostServices.getImagesUrls(post.images);
        }
        if (post.type === "video") {
          videoUrls = await PostServices.getVideosUrls(post.videos);
        }
        const postObj = {
          ...post._doc,
          creatorUsername,
          creatorAvatarImage: creatorAvatarImage
            ? creatorAvatarImage.url
            : null,
          subredditName,
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
      message: "Retrieved Subreddit's Posts",
      subredditPosts: postsWithVoteStatus,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error Getting Subreddit's Posts",
      error: err.message,
    });
  }
};

const getReportedPosts = async (req, res) => {
  const subredditName = req.query.subredditName;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }

    const query = Post.find({ _id: { $in: subreddit.reportedPosts } });
    const result = await UserServices.paginateResults(query, page, limit);

    if (result.slicedArray.length == 0) {
      return res.status(500).json({ message: "The retrieved array is empty" });
    }
    const postsWithVoteStatus = await Promise.all(
      result.slicedArray.map(async (post) => {
        const isUpvoted = post.upvotedUsers.includes(user._id);
        const isDownvoted = post.downvotedUsers.includes(user._id);
        let disapprovedByUserame, approvedByUserame;
        let disapprovedByAvatarImageUrl, approvedByAvatarImageUrl;

        if (post.disapprovedBy) {

          const disapprovedBy = await User.findById(post.disapprovedBy);
          disapprovedByUserame = disapprovedBy.userName;


          if (disapprovedBy.avatarImage != null) {
            const disapprovedByAvatarImage = await UserUploadModel.findById(disapprovedBy.avatarImage);
            disapprovedByAvatarImageUrl = disapprovedByAvatarImage.url;
          }
          else {
            disapprovedByAvatarImageUrl = null;
          }
        }
        else {
          disapprovedByAvatarImageUrl = null;
          disapprovedByUserame = null;
        }

        if (post.approvedBy != null) {
          const approvedBy = await User.findById(post.approvedBy);
          approvedByUserame = approvedBy.userName;
          console.log(approvedByUserame, approvedBy.avatarImage)
          if (approvedBy.avatarImage != null) {
            const approvedByAvatarImage = await UserUploadModel.findById(approvedBy.avatarImage);
            approvedByAvatarImageUrl = approvedByAvatarImage.url;
          }
          else {
            approvedByAvatarImageUrl = null;
          }
        }
        else {
          approvedByAvatarImageUrl = null;
          approvedByUserame = null;
        }
        let imageUrls, videoUrls;
        const isSaved = user.savedPosts.includes(post._id);
        const spammedBy = await User.find({ _id: { $in: post.spammedBy } });
        const spammedByUsernames = spammedBy.map((user) => user.userName);
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
          spammedByUsernames,
          isSaved,
          disapprovedByUserame,
          approvedByUserame,
          disapprovedByAvatarImageUrl,
          approvedByAvatarImageUrl,
        };
        delete postObj.images;
        delete postObj.videos;
        delete postObj.upvotedUsers;
        delete postObj.downvotedUsers;
        delete postObj.comments;
        delete postObj.spammedBy;
        return postObj;
      })
    );
    return res.status(200).json({
      message: "Retrieved subreddit's reported posts",
      reportedPosts: postsWithVoteStatus,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error getting subreddit's reported posts",
      error: err.message,
    });
  }
};

const getEditedPosts = async (req, res) => {
  const subredditName = req.query.subredditName;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    const subreddit = await subReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    console.log(subreddit.posts);
    const query = Post.find({ _id: { $in: subreddit.posts }, isEdited: true });

    const result = await UserServices.paginateResults(query, page, limit);

    if (result.slicedArray.length == 0) {
      return res.status(500).json({ message: "The retrieved array is empty" });
    }
    const postsWithVoteStatus = await Promise.all(
      result.slicedArray.map(async (post) => {
        const isUpvoted = post.upvotedUsers.includes(user._id);
        const isDownvoted = post.downvotedUsers.includes(user._id);
        let disapprovedByUserame, approvedByUserame;
        let disapprovedByAvatarImageUrl, approvedByAvatarImageUrl;

        if (post.disapprovedBy) {

          const disapprovedBy = await User.findById(post.disapprovedBy);
          disapprovedByUserame = disapprovedBy.userName;


          if (disapprovedBy.avatarImage != null) {
            const disapprovedByAvatarImage = await UserUploadModel.findById(disapprovedBy.avatarImage);
            disapprovedByAvatarImageUrl = disapprovedByAvatarImage.url;
          }
          else {
            disapprovedByAvatarImageUrl = null;
          }
        }
        else {
          disapprovedByAvatarImageUrl = null;
          disapprovedByUserame = null;
        }

        if (post.approvedBy != null) {
          const approvedBy = await User.findById(post.approvedBy);
          approvedByUserame = approvedBy.userName;
          console.log(approvedByUserame, approvedBy.avatarImage)
          if (approvedBy.avatarImage != null) {
            const approvedByAvatarImage = await UserUploadModel.findById(approvedBy.avatarImage);
            approvedByAvatarImageUrl = approvedByAvatarImage.url;
          }
          else {
            approvedByAvatarImageUrl = null;
          }
        }
        else {
          approvedByAvatarImageUrl = null;
          approvedByUserame = null;
        }
        let imageUrls, videoUrls;
        const spammedBy = await User.find({ _id: { $in: post.spammedBy } });
        const spammedByUsernames = spammedBy.map((user) => user.userName);
        const isSaved = user.savedPosts.includes(post._id);

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
          spammedByUsernames,
          isSaved,
          disapprovedByUserame,
          approvedByUserame,
          disapprovedByAvatarImageUrl,
          approvedByAvatarImageUrl,
        };
        delete postObj.images;
        delete postObj.videos;
        delete postObj.upvotedUsers;
        delete postObj.downvotedUsers;
        delete postObj.comments;
        delete postObj.spammedBy;
        return postObj;
      })
    );
    return res.status(200).json({
      message: "Retrieved subreddit's edited posts",
      editedPosts: postsWithVoteStatus,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error getting subreddit's edited posts",
      error: err.message,
    });
  }
};

const getUnmoderatedPosts = async (req, res) => {
  const subredditName = req.query.subredditName;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    const subreddit = await subReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }

    const query = Post.find({
      _id: { $in: subreddit.posts },
      approved: false,
      disapproved: false,
    });

    const result = await UserServices.paginateResults(query, page, limit);

    if (result.slicedArray.length == 0) {
      return res.status(500).json({ message: "The retrieved array is empty" });
    }
    const postsWithVoteStatus = await Promise.all(
      result.slicedArray.map(async (post) => {
        const isUpvoted = post.upvotedUsers.includes(user._id);
        const isDownvoted = post.downvotedUsers.includes(user._id);


        if (post.approvedBy != null) {
          const approvedBy = await User.findById(post.approvedBy);
          approvedByUserame = approvedBy.userName;
          console.log(approvedByUserame, approvedBy.avatarImage)
          if (approvedBy.avatarImage != null) {
            const approvedByAvatarImage = await UserUploadModel.findById(approvedBy.avatarImage);
            approvedByAvatarImageUrl = approvedByAvatarImage.url;
          }
          else {
            approvedByAvatarImageUrl = null;
          }
        }
        else {
          approvedByAvatarImageUrl = null;
          approvedByUserame = null;
        }
        let imageUrls, videoUrls;
        const spammedBy = await User.find({ _id: { $in: post.spammedBy } });
        const spammedByUsernames = spammedBy.map((user) => user.userName);
        const isSaved = user.savedPosts.includes(post._id);

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
          spammedByUsernames,
          isSaved,

        };
        delete postObj.images;
        delete postObj.videos;
        delete postObj.upvotedUsers;
        delete postObj.downvotedUsers;
        delete postObj.comments;
        delete postObj.spammedBy;
        return postObj;
      })
    );
    return res.status(200).json({
      message: "Retrieved subreddit's unmoderated posts",
      unmoderatedPosts: postsWithVoteStatus,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error getting subreddit's unmoderated posts",
      error: err.message,
    });
  }
};

const getRemovedPosts = async (req, res) => {
  const subredditName = req.query.subredditName;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    //get posts with isDisapproved=true

    const query = Post.find({ _id: { $in: subreddit.removedPosts } });
    const result = await UserServices.paginateResults(query, page, limit);
    if (result.slicedArray.length == 0) {
      return res.status(500).json({ message: "The retrieved array is empty" });
    }
    const postsWithVoteStatus = await Promise.all(
      result.slicedArray.map(async (post) => {
        let disapprovedByUserame, approvedByUserame;
        let disapprovedByAvatarImageUrl, approvedByAvatarImageUrl;

        if (post.disapprovedBy) {

          const disapprovedBy = await User.findById(post.disapprovedBy);
          disapprovedByUserame = disapprovedBy.userName;


          if (disapprovedBy.avatarImage != null) {
            const disapprovedByAvatarImage = await UserUploadModel.findById(disapprovedBy.avatarImage);
            disapprovedByAvatarImageUrl = disapprovedByAvatarImage.url;
          }
          else {
            disapprovedByAvatarImageUrl = null;
          }
        }
        else {
          disapprovedByAvatarImageUrl = null;
          disapprovedByUserame = null;
        }

        if (post.approvedBy != null) {
          const approvedBy = await User.findById(post.approvedBy);
          approvedByUserame = approvedBy.userName;
          console.log(approvedByUserame, approvedBy.avatarImage)
          if (approvedBy.avatarImage != null) {
            const approvedByAvatarImage = await UserUploadModel.findById(approvedBy.avatarImage);
            approvedByAvatarImageUrl = approvedByAvatarImage.url;
          }
          else {
            approvedByAvatarImageUrl = null;
          }
        }
        else {
          approvedByAvatarImageUrl = null;
          approvedByUserame = null;
        }

        const isUpvoted = post.upvotedUsers.includes(user._id);
        const isDownvoted = post.downvotedUsers.includes(user._id);
        let imageUrls, videoUrls;
        const spammedBy = await User.find({ _id: { $in: post.spammedBy } });
        const spammedByUsernames = spammedBy.map((user) => user.userName);
        const isSaved = user.savedPosts.includes(post._id);

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
          spammedByUsernames,
          isSaved,
          disapprovedByUserame,
          approvedByUserame,
          disapprovedByAvatarImageUrl,
          approvedByAvatarImageUrl,
        };
        delete postObj.images;
        delete postObj.videos;
        delete postObj.upvotedUsers;
        delete postObj.downvotedUsers;
        delete postObj.comments;
        delete postObj.spammedBy;
        return postObj;
      })
    );
    return res.status(200).json({
      message: "Retrieved subreddit's removed posts",
      removedPosts: postsWithVoteStatus,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error getting subreddit's removed posts",
      error: err.message,
    });
  }
};

const getScheduledPosts = async (req, res) => {
  const subredditId = req.query.subredditId;
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(403).json({ message: "You are not a moderator" });
    }
    const scheduledPosts = subreddit.scheduledPosts;
    if (scheduledPosts.length === 0) {
      return res.status(404).json({ message: "No scheduled posts found" });
    }

    scheduledPostswithsubredditNameAndUsername = await Promise.all(
      scheduledPosts.map(async (scheduledPost) => {
        const user = await User.findById(scheduledPost.user);
        const userName = user.userName;
        return {
          ...scheduledPost,
          subredditName: subreddit.name,
          userName: userName,
        };
      })
    );
    return res.status(200).json({
      message: "Retrieved scheduled posts",
      scheduledPosts: scheduledPostswithsubredditNameAndUsername,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting scheduledposts", error: error.message });
  }
};

const addBookmark = async (req, res) => {
  const userId = req.userId;
  const { subredditId, widgetName, description, buttons } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a moderator of this subreddit" });
    }
    if (!widgetName) {
      return res.status(400).json({ message: "Widget name is required" });
    }
    if (buttons && buttons.length > 0) {
      for (let button of buttons) {
        if (!button.label || !button.link) {
          return res
            .status(400)
            .json({ message: "Each button must have a label and a link" });
        }
      }
    }
    if (!subreddit.bookmarks) {
      subreddit.bookmarks = [];
    }
    subreddit.bookMarks.push({ widgetName, description, buttons });
    subreddit.orderWidget.push(
      subreddit.bookMarks[subreddit.bookMarks.length - 1]._id
    );
    await subreddit.save();

    res.status(200).json({
      message: "Bookmark added successfully",
      bookmark: { widgetName, description, buttons },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding bookmark", error: err.message });
  }
};
const editBookmark = async (req, res) => {
  const userId = req.userId;
  const { subredditId, widgetId, widgetName, description } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a moderator of this subreddit" });
    }
    if (!widgetId) {
      return res.status(400).json({ message: "Widget ID is required" });
    }
    const bookmarkIndex = subreddit.bookMarks.findIndex(
      (bookmark) => bookmark._id.toString() === widgetId
    );
    if (bookmarkIndex === -1) {
      return res.status(404).json({ message: "Bookmark not found" });
    }
    const bookmark = subreddit.bookMarks[bookmarkIndex];
    if (widgetName) {
      bookmark.widgetName = widgetName;
    }
    if (description) {
      bookmark.description = description;
    }
    await subreddit.save();
    res.status(200).json({ message: "Bookmark edited successfully", bookmark });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error editing bookmark", error: err.message });
  }
};
const deleteBookmark = async (req, res) => {
  const userId = req.userId;
  const { subredditId, widgetId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a moderator of this subreddit" });
    }
    if (!widgetId) {
      return res.status(400).json({ message: "Widget ID is required" });
    }
    const bookmarkIndex = subreddit.bookMarks.findIndex(
      (bookmark) => bookmark._id.toString() === widgetId
    );
    if (bookmarkIndex === -1) {
      return res.status(404).json({ message: "Bookmark not found" });
    }
    subreddit.bookMarks.splice(bookmarkIndex, 1);
    await subreddit.save();
    res.status(200).json({ message: "Bookmark deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting bookmark", error: err.message });
  }
};

const addBookmarkButton = async (req, res) => {
  const userId = req.userId;
  const { subredditId, widgetId, button } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a moderator of this subreddit" });
    }
    if (!widgetId) {
      return res.status(400).json({ message: "Widget ID is required" });
    }
    if (!button.label || !button.link) {
      return res
        .status(400)
        .json({ message: "Button must have a label and a link" });
    }
    const bookmarkIndex = subreddit.bookMarks.findIndex(
      (bookmark) => bookmark._id.toString() === widgetId
    );
    if (bookmarkIndex === -1) {
      return res.status(404).json({ message: "Bookmark not found" });
    }
    subreddit.bookMarks[bookmarkIndex].buttons.push(button);
    await subreddit.save();
    res
      .status(200)
      .json({ message: "Bookmark button added successfully", button });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding bookmark button", error: err.message });
  }
};
const editBookmarkButton = async (req, res) => {
  const userId = req.userId;
  const { subredditId, widgetId, buttonId, label, link } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a moderator of this subreddit" });
    }
    if (!widgetId) {
      return res.status(400).json({ message: "Widget ID is required" });
    }
    if (!buttonId) {
      return res.status(400).json({ message: "Button ID is required" });
    }
    if (!label && !link) {
      return res
        .status(400)
        .json({ message: "Either label or link is required" });
    }
    const bookmarkIndex = subreddit.bookMarks.findIndex(
      (bookmark) => bookmark._id.toString() === widgetId
    );
    if (bookmarkIndex === -1) {
      return res.status(404).json({ message: "Bookmark not found" });
    }
    const buttonIndex = subreddit.bookMarks[bookmarkIndex].buttons.findIndex(
      (button) => button._id.toString() === buttonId
    );
    if (buttonIndex === -1) {
      return res.status(404).json({ message: "Button not found" });
    }
    if (label) {
      subreddit.bookMarks[bookmarkIndex].buttons[buttonIndex].label = label;
    }
    if (link) {
      subreddit.bookMarks[bookmarkIndex].buttons[buttonIndex].link = link;
    }
    await subreddit.save();
    res.status(200).json({
      message: "Bookmark button edited successfully",
      button: subreddit.bookMarks[bookmarkIndex].buttons[buttonIndex],
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error editing bookmark button", error: err.message });
  }
};
const deleteBookmarkButton = async (req, res) => {
  const userId = req.userId;
  const { subredditId, widgetId, buttonId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a moderator of this subreddit" });
    }
    if (!widgetId) {
      return res.status(400).json({ message: "Widget ID is required" });
    }
    if (!buttonId) {
      return res.status(400).json({ message: "Button ID is required" });
    }
    const bookmarkIndex = subreddit.bookMarks.findIndex(
      (bookmark) => bookmark._id.toString() === widgetId
    );
    if (bookmarkIndex === -1) {
      return res.status(404).json({ message: "Bookmark not found" });
    }
    const buttonIndex = subreddit.bookMarks[bookmarkIndex].buttons.findIndex(
      (button) => button._id.toString() === buttonId
    );
    if (buttonIndex === -1) {
      return res.status(404).json({ message: "Button not found" });
    }
    subreddit.bookMarks[bookmarkIndex].buttons.splice(buttonIndex, 1);
    await subreddit.save();
    res.status(200).json({ message: "Bookmark button deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting bookmark button", error: err.message });
  }
};
const addRemovalReason = async (req, res) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  const title = req.body.title;
  const message = req.body.message;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a moderator of this subreddit" });
    }
    if (subreddit.removalReasons.length === 50) {
      return res
        .status(500)
        .json({ message: "Exceeded limit of 50 Reasons for the subreddit" });
    }
    subreddit.removalReasons.push({ title, message });
    await subreddit.save();
    res.status(200).json({ message: "Removal reason added successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error adding removal reason", error: error.message });
  }
};

const editRemovalReason = async (req, res) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  const reasonId = req.body.reasonId;
  const title = req.body.title;
  const message = req.body.message;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a moderator of this subreddit" });
    }
    const removalReasonIndex = subreddit.removalReasons.findIndex((reason) =>
      reason._id.equals(reasonId)
    );
    if (removalReasonIndex === -1) {
      return res.status(404).json({ message: "Removal reason not found" });
    }

    subreddit.removalReasons[removalReasonIndex].title = title;
    subreddit.removalReasons[removalReasonIndex].message = message;

    await subreddit.save();

    res.status(200).json({ message: "Removal reason edited successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error editing removal reason", error: error.message });
  }
};

const deleteRemovalReason = async (req, res) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  const reasonId = req.body.reasonId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a moderator of this subreddit" });
    }
    const removalReasonIndex = subreddit.removalReasons.findIndex((reason) =>
      reason._id.equals(reasonId)
    );
    if (removalReasonIndex === -1) {
      return res.status(404).json({ message: "Removal reason not found" });
    }
    subreddit.removalReasons.splice(removalReasonIndex, 1);
    await subreddit.save();
    res.status(200).json({ message: "Removal reason deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting removal reason", error: error.message });
  }
};

const getRemovalReasons = async (req, res) => {
  const userId = req.userId;
  const subredditId = req.query.subredditId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a moderator of this subreddit" });
    }
    res.status(200).json({
      message: "Retrieved subreddit removal reasons",
      removalReasons: subreddit.removalReasons,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error getting removal reasons", error: error.message });
  }
};

const inviteModerator = async (req, res) => {
  const userId = req.userId;
  const invitedModeratorUsername = req.body.invitedModeratorUsername;
  const subredditName = req.body.subredditName;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    const invitedModerator = await User.findOne({
      userName: invitedModeratorUsername,
    });
    if (subreddit.moderators.includes(invitedModerator._id)) {
      return res.status(400).json({ message: "User is already a moderator" });
    }
    if (!invitedModerator) {
      return res.status(404).json({ message: "Invited moderator not found" });
    }
    subreddit.invitedModerators.push(invitedModerator);
    await subreddit.save();
    res.status(200).json({ message: "Moderator invited successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error inviting moderator", error: error.message });
  }
};
const acceptModeratorInvite = async (req, res) => {
  const userId = req.userId;
  const subredditName = req.body.subredditName;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.invitedModerators.includes(userId)) {
      return res.status(400).json({ message: "You are not invited" });
    }
    if (subreddit.moderators.includes(userId)) {
      return res.status(400).json({ message: "You are already a moderator" });
    }
    subreddit.invitedModerators = subreddit.invitedModerators.filter(
      (invitedModerator) => invitedModerator.toString() !== userId.toString()
    );
    subreddit.moderators.push(userId);
    await subreddit.save();
    res.status(200).json({ message: "Moderator accepted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error accepting moderator invite",
      error: error.message,
    });
  }
};

const leaveModerator = async (req, res) => {
  const userId = req.userId;
  const subredditName = req.body.subredditName;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    subreddit.moderators = subreddit.moderators.filter(
      (moderator) => moderator.toString() !== userId.toString()
    );
    user.communities = user.communities.filter(
      (community) => community.toString() !== subreddit._id.toString()
    );
    await subreddit.save();
    res.status(200).json({ message: "Moderator left successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error leaving moderator", error: error.message });
  }
};

const getInvitedModerators = async (req, res) => {
  const subredditName = req.query.subredditName;
  const userId = req.userId;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const invitedModerators = await User.find({
      _id: { $in: subreddit.invitedModerators },
    });
    const invitedModeratorDetails = await Promise.all(
      invitedModerators.map(async (invitedModerator) => {
        const userUpload = await UserUploadModel.findOne({
          _id: invitedModerator.avatarImage,
        });
        return {
          _id: invitedModerator._id,
          userName: invitedModerator.userName,
          avatarImage: userUpload ? userUpload.url : null,
        };
      })
    );
    res.status(200).json({
      message: "Retrieved subreddit invited moderators",
      invitedModerators: invitedModeratorDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting invited moderators",
      error: error.message,
    });
  }
};

const declineModeratorInvite = async (req, res) => {
  const userId = req.userId;
  const subredditName = req.body.subredditName;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.invitedModerators.includes(userId)) {
      return res.status(400).json({ message: "You are not invited" });
    }
    subreddit.invitedModerators = subreddit.invitedModerators.filter(
      (invitedModerator) => invitedModerator.toString() !== userId.toString()
    );
    await subreddit.save();
    res.status(200).json({ message: "Moderator declined successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error declining moderator invite",
      error: error.message,
    });
  }
};

const changeSubredditType = async (req, res) => {
  const userId = req.userId;
  const subredditName = req.query.subredditName;
  const ageRestriction = req.query.ageRestriction;
  const privacyType = req.query.privacyType;
  if (!ageRestriction || !privacyType) {
    return res
      .status(400)
      .json({ message: "Age restriction and privacy type are required" });
  }
  if (
    privacyType !== "public" &&
    privacyType !== "private" &&
    privacyType !== "restricted"
  ) {
    return res.status(400).json({ message: "Invalid privacy type" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a moderator of this subreddit" });
    }
    subreddit.ageRestriction = ageRestriction;
    subreddit.privacy = privacyType;
    await subreddit.save();
    res.status(200).json({ message: "Subreddit type changed successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error changing subreddit type", error: error.message });
  }
};

const getSubredditType = async (req, res) => {
  const subredditName = req.query.subredditName;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    res.status(200).json({
      message: "Retrieved subreddit type",
      ageRestriction: subreddit.ageRestriction,
      privacy: subreddit.privacy,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error getting subreddit type", error: error.message });
  }
};
const forcedRemove = async (req, res) => {
  const userId = req.userId;
  const subredditName = req.body.subredditName;
  const userName = req.body.userName;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    const moderator = await User.findById(userId);
    if (!moderator) {
      return res
        .status(404)
        .json({ message: "User is not Allowed to Approve" });
    }
    const user = await User.findOne({ userName: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    subreddit.members.pop(user._id);
    user.communities.pop(subreddit._id);
    await subreddit.save();
    await user.save();

    res.json({ message: "User removed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing user", error: error.message });
  }
};

const getFavouriteCommunities = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const communities = await SubReddit.find({
    _id: { $in: user.favoriteCommunities },
  })

    const communitiesWithAvatar = await Promise.all(
      communities.map(async (community) => {
        const userUpload = await UserUploadModel.findOne({
          _id: community.appearance.avatarImage,
        });
        return {
          name: community.name,
          id: community._id,
          avatar: userUpload ? userUpload.url : null,
        };
      })
    );


  res
    .status(200)
    .json({ message: "Favourite communities retrieved", communitiesWithAvatar });
};

const removeModerator = async (req, res) => {
  const userId = req.userId;
  const subredditName = req.body.subredditName;
  const moderatorName = req.body.moderatorName;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    const moderator = await User.findOne({ userName: moderatorName });
    if (!moderator) {
      return res.status(404).json({ message: "Moderator not found" });
    }
    if (!subreddit.moderators.includes(moderator._id)) {
      return res.status(400).json({ message: "User is not a moderator" });
    }
    if (!subreddit.moderators.includes(userId)) {
      return res.status(400).json({ message: "You aren't a moderator" });
    }
    subreddit.moderators.pull(moderator._id);
    await subreddit.save();
    res.status(200).json({ message: "Moderator removed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing moderator", error: error.message });
  }
};
module.exports = {
  createCommunity,
  addRule,
  addTextWidget,
  editTextWidget,
  deleteTextWidget,
  reorderRules,
  getCommunityDetails,
  editCommunityDetails,
  getSubredditPosts,
  getSubRedditRules,
  editRule,
  deleteRule,
  uploadAvatarImage,
  getAvatarImage,
  uploadBannerImage,
  getBannerImage,
  getSubredditByNames,
  getSubredditRules,
  getWidget,
  getPopularCommunities,
  checkSubredditNameAvailability,
  getSubredditModerators,
  getSubredditMembers,
  getPendingMembers,
  getTrendingCommunities,
  suggestSubreddit,
  approveUser,
  UnapproveUser,
  removeSubredditMember,
  getBannedUsers,
  banUser,
  unbanUser,
  getSubredditFeed,
  getReportedPosts,
  getEditedPosts,
  getUnmoderatedPosts,
  addBookmark,
  editBookmark,
  deleteBookmark,
  addBookmarkButton,
  editBookmarkButton,
  deleteBookmarkButton,
  addRemovalReason,
  editRemovalReason,
  deleteRemovalReason,
  getRemovalReasons,
  inviteModerator,
  leaveModerator,
  getInvitedModerators,
  acceptModeratorInvite,
  declineModeratorInvite,
  getScheduledPosts,
  getRemovedPosts,
  changeSubredditType,
  forceApproveUser,
  forcedRemove,
  getFavouriteCommunities,
  getSubredditType,
  removeModerator,
};
