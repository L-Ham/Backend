const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema({
    userId: {
        type: Number,
        required: true,
        unique: true,
      },
    userName: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: false,
  },
  emailAddress: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  isConfirmed: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);
