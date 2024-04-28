const SubReddit = require("../models/subReddit");
const User = require("../models/user");
const subredditServices = require("../services/subredditServices");
const UserUploadModel = require("../models/userUploads");
const UserUpload = require("../controllers/userUploadsController");

const checkCommunitynameExists = (Communityname) => {
  return SubReddit.findOne({ name: Communityname });
};

const sorting = async (req, res, next) => {
  const subredditId = req.params.id;
  const { Hot, New, Top, Random } = req.params;

  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }

    let sortedPosts;
    if (Hot) {
      sortedPosts = subreddit.posts.sort((a, b) => b.votes - a.votes);
    } else if (New) {
      sortedPosts = subreddit.posts.sort((a, b) => b.createdAt - a.createdAt);
    } else if (Top) {
      sortedPosts = subreddit.posts.sort(
        (a, b) => b.votes + b.comments.length - (a.votes + a.comments.length)
      );
    } else if (Random) {
      sortedPosts = subreddit.posts.sort(() => Math.random() - 0.5);
    }

    res.json(sortedPosts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sorting posts", error: error.message });
  }
};
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
    res.status(500).json({ message: "Failed to create community",error:err.message });
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
    const userId = req.userId;
    const user = await User.findById(userId);
    const regex = new RegExp(`^${search}`, "i");
    const matchingNames = await SubReddit.find(
      { name: regex },
      "_id name appearance.avatarImage members"
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

    let response = {
      message: "Subreddit widgets retrieved successfully",
      communityDetails,
      textWidgets: textWidgetsById,
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

<<<<<<< Updated upstream
const getSubredditModerators = async (req, res, next) => {
  const subredditName = req.query.subredditName;
  try {
    const subreddit = await SubReddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    const moderators = await User.find({ _id: { $in: subreddit.moderators } });
    const moderatorDetails = await Promise.all(moderators.map(async (moderator) => {
      const userUpload = await UserUploadModel.findOne({ userId: moderator._id });
      return {
        _id: moderator._id,
        userName: moderator.userName,
        avatarImage: userUpload ? userUpload.avatarImage : null,
      };
    }));

    res.json({ message:"Retrieved subreddit moderators Successfully",moderators:moderatorDetails });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting subreddit moderators", error: error.message });
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
    const membersDetails = await Promise.all(moderators.map(async (member) => {
      const userUpload = await UserUploadModel.findOne({ userId: member._id });
      return {
        _id: member._id,
        userName: member.userName,
        avatarImage: userUpload ? userUpload.avatarImage : null,
      };
    }));

    res.json({message:"Retrieved subreddit Approved Users Successfully", approvedMembers:membersDetails });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting subreddit Members", error: error.message });
  }
}; 
=======

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
>>>>>>> Stashed changes
module.exports = {
  sorting,
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
<<<<<<< Updated upstream
  getSubredditModerators,
  getSubredditMembers,
=======
  getTrendingCommunities,
>>>>>>> Stashed changes
};
