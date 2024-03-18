const SubReddit = require("../models/subReddit");
const User = require("../models/user"); // to use it for create community
const authenticateToken = require("../middleware/authenticateToken");

const checkCommunitynameExists = async (Communityname) => {
  return await SubReddit.findOne({ name: Communityname });
};

const sorting = (req, res, next) => {
  const subreddit = SubReddit.findById(req.params.id)
    .then((subreddit) => {
      const { Hot, New, Top, Random } = req.params;
      if (Hot == true) {
        res.json(subreddit.posts.sort((a, b) => b.votes - a.votes));
      } else if (New == true) {
        res.json(subreddit.posts.sort((a, b) => b.createdAt - a.createdAt)); // need to add createdAt time stamp
      } else if (Top == true) {
        res.json(
          subreddit.posts.sort(
            (a, b) => b.comments.length - a.comments.length + b.votes - a.votes
          )
        );
      } else if (Random == true) {
        res.json(subreddit.posts.sort(() => Math.random() - 0.5));
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error sorting posts");
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
      let commName = checkCommunitynameExists(req.body.name);
      if (commName) {
        return res.status(404).json({ msg: "Community name already exists" });
      }
      SubReddit = new SubReddit({
        name: req.body.name,
        privacy: req.body.privacy,
        moderators: [user],
        members: [user],
        ageRestriction: req.body.ageRestriction,
        description: req.body.description,
        title: req.body.title,
        submissionText: req.body.submissionText,
        contentOptions: req.body.contentOptions,
        wiki: req.body.wiki,
        spamFilter: req.body.spamFilter,
      });
      SubReddit
        .save()
        .then((subReddit) => {
          user.communities.push(subReddit);
          user
            .save()
            .then((user) => {
              console.log("Subreddit attached to user: ", user);
              // res.json(user);
            })
            .catch((err) => {
              console.error("Error attaching subReddit to user:", err);
              res.status(500).json({ msg: "Server error" });
            });
          console.log("Community created: ", subReddit);
          res.json(subReddit);
        })
        .catch((err) => {
          console.error("Error saving community:", err);
          res.status(500).json({ msg: "Server error", subReddit: SubReddit });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ msg: "Server error" });
    });
};

module.exports = {
  sorting,
  createCommunity,
};
