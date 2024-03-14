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

const editNotificationSettings = (req, res, next) => {
  const id = req.params.id;
  const notificationSettings = req.body.notificationSettings;

  User.findByIdAndUpdate(id, { notificationSettings }, { new: true })
    .then((user) => {
      console.log("Updated notification settings: ", user.notificationSettings);
      res.json({ notificationSettings: user.notificationSettings });
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = {
  getUserSettings,
  getNotificationSettings,
  editNotificationSettings
};
