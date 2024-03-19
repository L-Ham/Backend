const User = require("../models/user");
const authService = require("../services/authServices");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
const CLIENT_ID =
  "332399911432-vjl376a05ukf0hhpj6kq0hnuibij26dh.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

const googleSignUp = async (req, res, next) => {
  let token = req.body.token;
  let payload = {};

  // Function to check if the generated username exists in the database
  const checkUsernameExists = async (username) => {
    return await User.findOne({ userName: username });
  };

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const tempPayload = ticket.getPayload();
    payload = tempPayload;
  }
  try {
    await verify();
    const existingUser = await User.findOne({ email: payload["email"] });
    if (existingUser) {
      res.status(500).json({ message: "Email already Exists" });
    }
    let randomUsername = authService.generateRandomUsername();
    let user = await checkUsernameExists(randomUsername[0]);
    while (user) {
      randomUsername = authService.generateRandomUsername();
      user = await checkUsernameExists(randomUsername[0]);
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    user = new User({
      userName: randomUsername[0],
      email: payload["email"],
      password: randomPassword,
      signupGoogle: true,
    });

    user = await user.save();

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
    res.status(500).json({ message: "Google Sign Up Failed", error: err });
  }
};

const logout = (req, res, next) => {
  res.clearCookie("token");
};

const googleLogin = (req, res, next) => {
  const token = req.body.token;
};

const forgetUsername = async (req, res, next) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: "r75118106@gmail.com",
        pass: "L-Ham123456",
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
  

const forgetPassword = (req, res, next) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "r75118106@gmail.com",
      pass: "L-Ham123456",
    },
  });
  const email = req.body.email;
  const user = User.find((user) => user.email === email);
  if (!user) {
    return res.status(404).send("User not found");
  }
  transporter.sendMail(
    {
      from: "r75118106@gmail.com",
      to: email,
      subject: "So you wanna reset your Reddit password, huh?",
      text: `Hi there,

        You forgot it didn't you? Hey, it happens. Here you go:
        
        Your password is https://localhost:5000/user/resetPassword/${token}`,
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
  const { token, password } = req.body;
  const user = User.find((user) => user.token === token);
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
  const { userName, password } = req.body;
  try {
    const user = await User.findOne({ userName });
    console.log(user);
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const payload = {
      user: {
        id: user._id,
        type: "normal",
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 500000000000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token, message: "User logged in successfully" });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const signUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      userName,
      email,
      password,
      signupGoogle: false,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user._id,
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
    res.status(500).send("Server error");
  }
};
const generateUserName = (req, res, next) => {
  try {
    let userNames = authService.generateRandomUsername();
    res
      .status(200)
      .json({
        message: "Usernames created Successfully",
        usernames: userNames,
      });
  } catch {
    res.status(500).json({ message: "Error Creating usernames" });
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
};
