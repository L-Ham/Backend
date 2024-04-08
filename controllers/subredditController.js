const SubReddit = require("../models/subReddit");
const User = require("../models/user");

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
      moderators: [user._id],
      members: [user._id],
      ageRestriction: req.body.ageRestriction,
      description: req.body.description,
      title: req.body.title,
      submissionText: req.body.submissionText,
      contentOptions: req.body.contentOptions,
      wiki: req.body.wiki,
      spamFilter: req.body.spamFilter,
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

const addRuleWidget = async (req, res, next) => {
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

    // Ensure the widgets array exists
    if (!subreddit.widgets) {
      subreddit.widgets = [];
    }

    // Find the rulesWidgets subarray or create it if it doesn't exist
    let rulesWidgetsIndex = subreddit.widgets.findIndex(widget => widget.type === 'rulesWidgets');
    if (rulesWidgetsIndex === -1) {
      subreddit.widgets.push({ type: 'rulesWidgets', data: [] });
      rulesWidgetsIndex = subreddit.widgets.length - 1;
    }

    // Check maximum limit of rules widgets
    if (subreddit.widgets.length >= 20) {
      return res.status(400).json({ message: "Maximum 20 rules allowed" });
    }
    if (subreddit.widgets[rulesWidgetsIndex].data.length >= 15) {
      return res.status(400).json({ message: "Maximum 15 rules allowed" });
    }

    // Push the new rule widget to the rulesWidgets subarray
    subreddit.widgets[rulesWidgetsIndex].data.push({
      ruleText: rule,
      fullDescription: description,
      appliesTo: appliedTo,
      reportReason: reportReasonDefault,
    });

    // Save the subreddit with the updated widgets
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

    // Ensure the widgets array exists
    if (!subreddit.widgets) {
      subreddit.widgets = [];
    }

    // Find the textWidgets subarray or create it if it doesn't exist
    let textWidgetsIndex = subreddit.widgets.findIndex(widget => widget.type === 'textWidgets');
    if (textWidgetsIndex === -1) {
      subreddit.widgets.push({ type: 'textWidgets', data: [] });
      textWidgetsIndex = subreddit.widgets.length - 1;
    }

    // Check maximum limit of text widgets
    if (subreddit.widgets[textWidgetsIndex].data.length >= 20) {
      return res.status(400).json({ message: "Maximum 20 text widgets allowed" });
    }

    // Push the new text widget to the textWidgets subarray
    subreddit.widgets[textWidgetsIndex].data.push({
      widgetName,
      text,
    });

    // Save the subreddit with the updated widgets
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
  console.log(req.body);

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

    if (!subreddit.widgets || !subreddit.widgets.textWidgets) {
      return res.status(404).json({ message: "No text widgets found" });
    }

    const textWidget = subreddit.widgets.textWidgets.id(textWidgetId);
    if (!textWidget) {
      return res.status(404).json({ message: "Text widget not found" });
    }

    textWidget.widgetName = widgetName;
    textWidget.text = text;

    const savedSubreddit = await subreddit.save();
    res.json({
      message: "Text widget edited successfully",
      savedSubreddit,
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

    if (!subreddit.widgets || !subreddit.widgets.textWidgets) {
      return res.status(404).json({ message: "No text widgets found" });
    }

    const textWidget = subreddit.widgets.textWidgets.id(textWidgetId);
    if (!textWidget) {
      console.log("Text widget with provided ID not found");
      return res.status(404).json({ message: "Text widget not found" });
    }

    subreddit.widgets.textWidgets.pull(textWidgetId);

    const savedSubreddit = await subreddit.save();
    res.json({
      message: "Text widget deleted successfully",
      savedSubreddit,
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
    if (!subreddit.widgets || !subreddit.widgets.rulesWidgets) {
      return res.status(404).json({ message: "No rule widgets found" });
    }

    const reorderedRules = [];
    rulesOrder.forEach((ruleId) => {
      const rule = subreddit.widgets.rulesWidgets.id(ruleId);
      if (rule) {
        reorderedRules.push(rule);
      }
    });

    subreddit.widgets.rulesWidgets = reorderedRules;

    const savedSubreddit = await subreddit.save();
    res.json({
      message: "Rules reordered successfully",
      savedSubreddit,
    });
  } catch (error) {
    console.log("Error reordering rules:", error);
    res.status(500).json({ message: "Error reordering rules" });
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
const subRedditWidgets = async (req, res, next) => {
  const subredditId = req.body.subredditId;
  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    res.json({
      message: "Subreddit widgets retrieved successfully",
      widgets: subreddit.widgets
    });
  } catch (error) {
    console.error("Error getting subreddit widgets:", error);
    res.status(500).json({ message: "Error getting subreddit widgets" });
  }
};

module.exports = {
  sorting,
  createCommunity,
  addRuleWidget,
  addTextWidget,
  editTextWidget,
  deleteTextWidget,
  reorderRules,
  editCommunityDetails,
  subRedditWidgets,
  
};
