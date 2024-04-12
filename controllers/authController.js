const User = require("../models/user");
const authService = require("../services/authServices");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);

const googleSignUp = async (req, res) => {
  try {
    const data = req.decoded;
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(500).json({ message: "Email already Exists" });
    }
    const checkUsernameExists = async (username) => {
      return await User.findOne({ userName: username });
    };
    let randomUsername = authService.generateRandomUsername();
    let user = await checkUsernameExists(randomUsername[0]);
    while (user) {
      randomUsername = authService.generateRandomUsername();
      user = await checkUsernameExists(randomUsername[0]);
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    generatedPassword = await bcrypt.hash(randomPassword, salt);
    user = new User({
      userName: randomUsername[0],
      email: data.email,
      password: generatedPassword,
      signupGoogle: true,
    });
    user = await user.save();
    console.log(user);
    const payload = {};
    payload.user = { id: user._id, type: "google" };
    const expirationTime = Math.floor(Date.now() / 1000) + 50000000000;
    payload.exp = expirationTime;
    const newToken = jwt.sign(payload, process.env.JWT_SECRET);

    res.cookie("session-token", newToken);
    res.status(200).json({
      message: "User Signup Successfully",
      user: user,
      token: newToken,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Google Sign Up Failed", error: err.message });
  }
};

const logout = (req, res, next) => {
  res.clearCookie("token");
};

const googleLogin = async (req, res, next) => {
  const data = req.decoded;
  try {
    const user = await User.findOne({ email: data.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user && user.signupGoogle === false) {
      return res
        .status(404)
        .json({ message: "User didn't signup using google signup" });
    }
    const jwtPayload = {
      user: {
        id: user._id,
        type: "google",
      },
    };
    const expirationTime = Math.floor(Date.now() / 1000) + 50000000000;
    jwtPayload.exp = expirationTime;

    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET);

    res.status(200).json({
      message: "User logged in successfully",
      token: jwtToken,
      user: user,
    });
  } catch (error) {
    console.error("Google login failed:", error);
    res
      .status(500)
      .json({ message: "Google login failed", error: error.message });
  }
};

const forgetUsername = async (req, res, next) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "r75118106@gmail.com",
      pass: "bcmiawurnnoaxoeg",
    },
  });

  const email = req.body.email;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).send("User not found");
  }

  transporter.sendMail(
    {
      from: "r75118106@gmail.com",
      to: email,
      subject: "So you wanna know your Reddit username, huh?",
      text: `Hi there,
  
          You forgot it didn't you? Hey, it happens. Here you go:
          
          Your username is ${user.userName}
          
          (Username checks out, nicely done.)`,
    },
    (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
        return res.status(500).send("Failed to send email: " + err.message);
      }
      console.log("Email sent:", info.response);
      res.send("Email sent");
    }
  );
};

const forgetPassword = async (req, res, next) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "r75118106@gmail.com",
      pass: "bcmiawurnnoaxoeg",
    },
  });
  const email = req.body.email;
  const username = req.body.username;
  let user;
  if (!username) {
    user = await User.findOne({ email: email });
  } else if (!email) {
    user = await User.findOne({ userName: username });
  } else {
    user = await User.findOne({ email: email, userName: username });
  }
  if (!user) {
    return res.status(404).send("User not found");
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  transporter.sendMail(
    {
      from: "r75118106@gmail.com",
      to: email,
      subject: "Reddit password reset",
      text: `Hi ${user.userName},

      Thanks for requesting a password reset. To create a new password, just use the link below
        
         https://reddit-bylham.me/resetpassword?token=${token}
         If you didn’t make this request, you can ignore this email and carry on as usual.
         `,
    },
    (err) => {
      if (err) {
        console.error("Error sending email:", err);
        return res.status(500).send("Failed to send email");
      }
      res.send("Email sent");
    }
  );
};

const resetPassword = async (req, res, next) => {
  const { password } = req.body;
  const userId = req.userId;
  const user = User.findById(userId);
  if (!user) {
    return res.status(404).send("User not found");
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  res.send("Password reset successfully");
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { userName, password, email } = req.body;
  try {
    const user = await User.findOne({ $or: [{ userName }, { email }] });
    console.log("userrrr", user);
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid username/email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid username/email or password" });
    }
    const payload = {
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        type: "normal",
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 10800 },
      (err, token) => {
        if (err) throw err;
        res.json({ token, message: "User logged in successfully" });
      }
    );
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const signUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userName, email, password, gender } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    user = new User({
      userName,
      email,
      password,
      gender,
      signupGoogle: false,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        type: "normal",
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 500000000000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token, message: "User registered successfully" });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
const generateUserName = async (req, res, next) => {
  try {
    const userNames = await authService.generateRandomUsername();
    res.status(200).json({
      message: "Usernames created Successfully",
      usernames: userNames,
    });
  } catch (err) {
    console.error("Error generating usernames:", err);
    res.status(500).json({ message: "Error Creating usernames" });
  }
};
const updatePassword = async (req, res, next) => {
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;
  if (password !== passwordConfirm) {
    return res.status(400).send("Passwords do not match");
  }
  if (password.length == 0 || passwordConfirm.length == 0) {
    return res.status(400).send("Password cannot be empty");
  }

  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).send("User not found");
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();
  res.send("Password updated successfully");
};

const updateEmail = async (req, res, next) => {
  const password = req.body.password;
  const email = req.body.newEmail;
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.email = email;
  await user.save();
  res.json({ message: "Email updated successfully" });
};
const googleDisconnect = async (req, res, next) => {
  const userId = req.userId;
  const password = req.body.password;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.signupGoogle === false) {
      return res
        .status(400)
        .json({ message: "User didn't signup using google signup" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    user.signupGoogle = false;
    await user.save();
    return res
      .status(200)
      .json({ message: "Google disconnected successfully" });
  } catch (err) {
    console.error("Error disconnecting google:", err.message);
    res.status(500).json({ message: "Error disconnecting google" });
  }
};

const googleConnect = async (req, res, next) => {
  const userId = req.userId;
  const password = req.body.password;
  const data = req.decoded;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.signupGoogle === true) {
      return res
        .status(400)
        .json({ message: "User already connected to google" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    user.signupGoogle = true;
    user.email = data.email;
    await user.save();
    return res
      .status(200)
      .json({ message: "Google connected successfully", user: user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error Connecting google", error: err.message });
  }
};
module.exports = {
  googleSignUp,
  googleLogin,
  login,
  forgetUsername,
  signUp,
  logout,
  forgetPassword,
  generateUserName,
  resetPassword,
  updatePassword,
  updateEmail,
  googleDisconnect,
  googleConnect,
};
