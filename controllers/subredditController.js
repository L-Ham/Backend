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
      return res.status(404).json({ message: 'Subreddit not found' });
    }

    let sortedPosts;
    if (Hot) {
      sortedPosts = subreddit.posts.sort((a, b) => b.votes - a.votes);
    } else if (New) {
      sortedPosts = subreddit.posts.sort((a, b) => b.createdAt - a.createdAt);
    } else if (Top) {
      sortedPosts = subreddit.posts.sort((a, b) => (b.votes + b.comments.length) - (a.votes + a.comments.length));
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
  const subredditId = req.body.subredditId;
  const { rule, description, appliedTo, reportReasonDefault } = req.body;

  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }
    if (!subreddit.widgets) {
      subreddit.widgets = {};
    }
    if (!subreddit.widgets.rulesWidgets) {
      subreddit.widgets.rulesWidgets = [];
    }

    subreddit.widgets.rulesWidgets.push({
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
}
const addTextWidget = async (req, res, next) => {
  const subredditId = req.body.subredditId;
  const { widgetName, text } = req.body;

  try {
    const subreddit = await SubReddit.findById(subredditId);
    if (!subreddit) {
      return res.status(404).json({ message: "Subreddit not found" });
    }

    if (!subreddit.widgets) {
      subreddit.widgets = {};
    }

    if (!subreddit.widgets.text) {
      subreddit.widgets.text = [];
    }
  
    subreddit.widgets.textWidgets.push({
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
}




module.exports = {
  sorting,
  createCommunity,
  addRuleWidget,
  addTextWidget
};
