const User = require("../models/user");


const getUserSettings = (req, res, next) => {
  //TODO: const user = TOKENNN
  const user = User.findById(req.params.id)
    .then((user) => {
      console.log("User settings: ", user);
      res.json({ gender: user.gender, email: user.email });
    })
    .catch((err) => {
      console.log(err);
    });
};


const getNotificationSettings = (req, res, next) => {
  
  const user = User.findById(req.params.id)
    .then((user) => {
      console.log("Notification settings: ", user.notificationSettings);
      res.json({ notificationSettings: user.notificationSettings });
    })
    .catch((err) => {
      console.log(err);
    });
};    

const getProfileSettings = (req, res, next) => {
  const user = User.findById(req.params.id)
    .then((user) => {
      const profileSettings = {
        displayName: user.name,
        about: user.About,
        avatar: user.avatar,
        nsfw: user.isNSFW,
        allowFollow: user.allowFollow
    };
    console.log("Profile settings: ", profileSettings);
    res.json({ profileSettings });
    })
    .catch((err) => {
      console.log(err);
    });
}


module.exports = {
  getUserSettings,
  getNotificationSettings,
  getProfileSettings
};
