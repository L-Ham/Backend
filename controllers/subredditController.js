const SubReddit = require("../models/subReddit");
const User = require("../models/user");
const subredditServices = require("../services/subredditServices");
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
    console.error("Error sorting posts:", error);
    res.status(500).json({ message: "Error sorting posts" });
  }
};
const createCommunity = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for user ID:", userId);
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
      communityDetails: {
        membersNickname: "Members",
        currentlyViewingNickname: "Online",
        communityDescription: "",
      },
      widgets: [],
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

    user.communities.push(savedCommunity._id);
    user.moderates.push(savedCommunity._id);
    const savedUser = await user.save();

    console.log("Subreddit attached to user: ", savedUser);
    console.log("Community created: ", savedCommunity);

    res.json({
      message: "Created community successfully",
      savedCommunity,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Failed to create community" });
  }
};

const addRule = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  const { rule, description, appliedTo, reportReasonDefault } = req.body;

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

    subreddit.rules.push({
      ruleText: rule,
      fullDescription: description,
      appliesTo: appliedTo,
      reportReason: reportReasonDefault,
    });

    const savedSubreddit = await subreddit.save();
    res.json({
      message: "Rule added successfully",
      savedSubreddit,
    });
  } catch (error) {
    console.log("Error adding rule:", error);
    res.status(500).json({ message: "Error adding rule" });
  }
};
const editRule = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  const ruleId = req.body.ruleId;
  const { rule, description, appliedTo, reportReasonDefault } = req.body;
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
    const ruleIndex = subreddit.rules.findIndex(
      (rule) => rule._id.toString() === ruleId
    );
    if (ruleIndex === -1) {
      return res.status(404).json({ message: "Rule not found" });
    }
    subreddit.rules[ruleIndex].ruleText = rule;
    subreddit.rules[ruleIndex].fullDescription = description;
    subreddit.rules[ruleIndex].appliesTo = appliedTo;
    subreddit.rules[ruleIndex].reportReason = reportReasonDefault;
    const savedSubreddit = await subreddit.save();
    res.json({
      message: "Rule edited successfully",
      rules: subreddit.rules,
    });
  } catch (error) {
    console.log("Error editing rule:", error);
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
    const ruleIndex = subreddit.rules.findIndex(
      (rule) => rule._id.toString() === ruleId
    );
    if (ruleIndex === -1) {
      return res.status(404).json({ message: "Rule not found" });
    }
    subreddit.rules.splice(ruleIndex, 1);
    await subreddit.save();
    res.json({
      message: "Rule deleted successfully",
      rules: subreddit.rules,
    });
  } catch (error) {
    console.log("Error deleting rule:", error);
    res.status(500).json({ message: "Error deleting rule" });
  }
};

const addTextWidget = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  const { widgetName, text } = req.body;

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
    });

    const savedSubreddit = await subreddit.save();
    res.json({
      message: "Text widget added successfully",
      savedSubreddit,
    });
  } catch (error) {
    console.log("Error adding text widget:", error);
    res.status(500).json({ message: "Error adding text widget" });
  }
};
const editTextWidget = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
  const textWidgetId = req.body.textWidgetId;
  const { widgetName, text } = req.body;

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
      console.log("Text widget with provided ID not found");
      return res.status(404).json({ message: "Text widget not found" });
    }
    textWidget.widgetName = widgetName;
    textWidget.text = text;
    const savedSubreddit = await subreddit.save();
    res.json({
      message: "Text widget edited successfully",
      widgets: subreddit.textWidgets,
    });
  } catch (error) {
    console.log("Error editing text widget:", error);
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
    console.log("Error deleting text widget:", error);
    res.status(500).json({ message: "Error deleting text widget" });
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

    const rules = subreddit.rules;

    if (rulesOrder.length !== rules.length) {
      return res
        .status(400)
        .json({
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

    subreddit.rules = reorderedRules;

    const savedSubreddit = await subreddit.save();

    res.json({
      message: "Rules reordered successfully",
      rules: savedSubreddit.rules,
    });
  } catch (error) {
    console.log("Error reordering rules:", error);
    res.status(500).json({ message: "Error reordering rules" });
  }
};

const getSubredditPosts = async (req, res, next) => {
  const userId = req.userId;
  const subredditId = req.body.subredditId;
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
    const membersNickname = req.body.membersNickname;
    const currentlyViewingNickname = req.body.currentlyViewingNickname;
    const communityDescription = req.body.communityDescription;
    subreddit.communityDetails.set("membersNickname", membersNickname);
    subreddit.communityDetails.set(
      "currentlyViewingNickname",
      currentlyViewingNickname
    );
    subreddit.communityDetails.set(
      "communityDescription",
      communityDescription
    );
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
  const subredditId = req.body.subredditId;
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
    console.error("Error getting subreddit rules:", error);
    res.status(500).json({ message: "Error getting subreddit rules" });
  }
};

module.exports = {
  sorting,
  createCommunity,
  addRule,
  addTextWidget,
  editTextWidget,
  deleteTextWidget,
  reorderRules,
  editCommunityDetails,
  getSubredditPosts,
  getSubRedditRules,
  editRule,
  deleteRule,
};
