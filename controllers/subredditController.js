const Subreddit = require("../models/subReddit");

const sorting = (req, res, next) => {
  const subreddit = Subreddit.findById(req.params.id)
  .then((subreddit) => {
  const Hot = req.params.Hot;
  const New = req.params.New; 
  const Top = req.params.Top;
  const Random = req.params.Random;
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
  });
  
  

};


module.exports = {
    sorting
};