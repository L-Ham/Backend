const subReddit = require("../models/subReddit");
const User = require("../models/user"); // to use it for create community
const authenticateToken = require("../middleware/authenticateToken");

const checkCommunitynameExists =  (Communityname) => {
  return  subReddit.findOne({ name: Communityname });
};

const sorting = (req, res, next) => {
  const subreddit = Subreddit.findById(req.params.id)
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
  console.log("createee communittyyyy heree")
  console.log("userr idd: ", userId)

  User.findById(userId)
    .then((user) => {
      if (!user) {
        console.error("User not found for user ID:", userId);
        return res.status(404).json({ msg: "User not found" });
      }

      checkCommunitynameExists(req.body.name)
        .then((existingCommunity) => {
          if (existingCommunity) {
            return res.status(400).json({ msg: "Community name already exists" });
          }

          const newCommunity = new subReddit({
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

          newCommunity.save()
            .then((savedCommunity) => {
              user.communities.push(savedCommunity);
              user.save()
                .then((savedUser) => {
                  console.log("Subreddit attached to user: ", savedUser);
                  console.log("Community created: ", savedCommunity);
                  res.json(savedCommunity);
                })
                .catch((err) => {
                  console.error("Error attaching subReddit to user:", err);
                  res.status(500).json({ msg: "Server error" });
                });
            })
            .catch((err) => {
              console.error("Error saving community:", err);
              res.status(500).json({ msg: "Server error", subReddit: newCommunity });
            });
        })
        .catch((err) => {
          console.error("Error checking existing community:", err);
          res.status(500).json({ msg: "Server error" });
        });
    })
    .catch((err) => {
      console.error("Error retrieving user:", err);
      res.status(500).json({ msg: "Server error" });
    });
};

module.exports = {
  sorting,
  createCommunity
};
