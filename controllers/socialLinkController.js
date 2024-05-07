const SocialLink = require("../models/socialLink");
const User = require("../models/user");
const authenticateToken = require("../middleware/authenticateToken");
const jwt = require("jsonwebtoken");

const addSocialLink = async (req, res) => {
  const userId = req.user.id;
  const { link, appName, logo, displayText } = req.body;
  const newSocialLink = new SocialLink({
    link,
    appName,
    logo,
    displayText,
  });
  newSocialLink
    .save()
    .then((socialLink) => {
      res
        .status(201)
        .json({ message: "Social Link added successfully", link: socialLink });
      User.findById(req.user.userId)
        .then((user) => {
          user.socialLinks.push(socialLink);
        })
        .catch((err) => {});
    })
    .catch((err) => {
      res.status(500).json({ message: "Error Adding Social Link" });
    });
};

module.exports = { addSocialLink };
