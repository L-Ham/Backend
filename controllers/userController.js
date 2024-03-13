const User = require("../models/user");
const getUserSettings = (req, res, next) => {
  //TODO: const user = TOKENNN
  User.findById(req.params.id)
    .then((user) => {
      console.log("User settings: ", user);
      res.json({ gender: user.gender, email: user.email });
    })
    .catch((err) => {
      console.log(err);
    });
};
module.exports = {
  getUserSettings,
};
