const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  user_ID: {
    type: String,
    required: true,
    unique: true,
    primary: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },  
  name: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  allowFollow: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  friends: {
    type: [String],
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatar: {
    type: Image,
    required: false,
  },
  isNSFW: {
    type: Boolean,
    required: false,
  },
  postHistory: {
    type: string,
    required: true,
  },
  About: {
    type: string,
    required: false,
  }
});

module.exports = mongoose.model("user", userSchema);
