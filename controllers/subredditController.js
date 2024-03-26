const SubReddit = require("../models/subReddit");
const User = require("../models/user");

const checkCommunitynameExists = (Communityname) => {
  return SubReddit.findOne({ name: Communityname });
};

const sorting = (req, res, next) => {   // we may face an error and the solution is to replace else if -> if , and use promise.all
  const subreddit = SubReddit.findById(req.params.id)
    .then((subreddit) => {
      const { Hot, New, Top, Random } = req.params;
      if (Hot == true) {
        res.json(subreddit.posts.sort((a, b) => b.votes - a.votes));
      }
      if (New == true) {
        res.json(subreddit.posts.sort((a, b) => b.createdAt - a.createdAt)); // need to add createdAt time stamp
      }
      if (Top == true) {
        res.json(subreddit.posts.sort((a, b) => b.comments.length - a.comments.length + b.votes - a.votes));
      }
      if (Random == true) {
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
  console.log("createee communittyyyy heree");
  console.log("userr idd: ", userId);

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }

      checkCommunitynameExists(req.body.name)
        .then((existingCommunity) => {
          if (existingCommunity) {
            return res
              .status(400)
              .json({ message: "Community name already exists" });
          }
          if (req.body.name=="") {
            return res
              .status(400)
              .json({ message: "Community name is required" });
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

          newCommunity
            .save()
            .then((savedCommunity) => {
              user.communities.push(savedCommunity._id);
              user
                .save()
                .then((savedUser) => {
                  console.log("Subreddit attached to user: ", savedUser);
                  console.log("Community created: ", savedCommunity);
                  res.json({
                    message: "Created community successfully",
                    savedCommunity,
                  });
                })
                .catch((err) => {
                  console.error("Error attaching subReddit to user:", err);
                  res.status(500).json({ msg: "Server error" });
                });
            })
            .catch((err) => {
              console.error("Error saving community:", err);
              res
                .status(500)
                .json({ message: "Server error", subReddit: newCommunity });
            });
        })
        .catch((err) => {
          console.error("Error checking existing community:", err);
          res.status(500).json({ message: "Server error" });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ message: "Server error" });
    });
};

module.exports = {
  sorting,
  createCommunity,
};
