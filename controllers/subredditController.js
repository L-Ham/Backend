const subReddit = require("../models/subReddit");
const Subreddit = require("../models/subReddit");
const User = require("../models/user"); // to use it for create community

const sorting = (req, res, next) => {
  const subreddit = Subreddit.findById(req.params.id)
  .then((subreddit) => {
  const { Hot, New, Top, Random } = req.params;
  if (Hot == true) 
  {
    res.json( subreddit.posts.sort((a, b) => b.votes - a.votes) );
  } else if (New == true) 
  {
    res.json( subreddit.posts.sort((a, b) => b.createdAt - a.createdAt) ); // need to add createdAt time stamp
  } else if (Top == true) 
  {
    res.json( subreddit.posts.sort((a, b) => b.comments.length - a.comments.length + b.votes - a.votes) );
  } else if (Random == true) 
  {
    res.json( subreddit.posts.sort(() => Math.random() - 0.5) );
  }
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send('Error sorting posts');
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
      const community = {
        name: req.body.name, // after the finish of username availability i should call it to check if the name is available
        type: req.body.privacy,
        ageRestriction: req.body.ageRestriction,
      };
      user.communities.push(community);
      user
        .save()
        .then((updatedUser) => {
          console.log("Community created: ", community);
          res.json(community);
        })
        .catch((err) => {
          console.error("Error saving community:", err);
          res.status(500).json({ msg: "Server error" });
        });
        subReddit = new Subreddit({
          name: req.body.name,
          privacy: req.body.privacy,
          ageRestriction: req.body.ageRestriction,
          description: req.body.description,
          title: req.body.title,
          sideBar: req.body.sideBar,
          submissionText: req.body.submissionText,
          contentOptions: req.body.contentOptions,
          wiki: req.body.wiki,
          spamFilter: req.body.spamFilter,
        });
        subReddit
          .save()
          .then((subReddit) => {
            console.log("Community created: ", subReddit);
            res.json(subReddit);
          })
          .catch((err) => {
            console.error("Error saving community:", err);
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