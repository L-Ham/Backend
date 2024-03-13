const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const Schema = mongoose.Schema;
const socialLinkSchema = new Schema({
  link: {
    type: String,
    required: true,
    unique: true,
    primary: true
  },
  appName: {
    type: String,
    required: true
  },
  logo: {
    type: Image,
    required: true
  },
  displayText: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("socialLink", socialLinkSchema);
