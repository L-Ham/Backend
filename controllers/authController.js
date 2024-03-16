const User = require("../models/user"); // Import User model
const nodemailer = require("nodemailer"); // Email sending
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "332399911432-vjl376a05ukf0hhpj6kq0hnuibij26dh.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

const googleSignUp = (req, res, next) => {
  let token = req.body.token;
  // console.log(token);
  ////////////////////////////////////////////////////
  let payload = {};
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const tempPayload = ticket.getPayload();
    payload = tempPayload;
  }
  payload.tokenType = "google";
  console.log("SERR YASTAAA SERRR");
  console.log(process.env.JWT_SECRET);
  const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: 500000000000,
  });
  ////////////////////////////////////////////////////
  verify()
    .then(() => {
      res.cookie("session-token", newToken);
      const randomPassword = Math.random().toString(36).slice(-8);
      const user = new User({
        userName: payload["name"],
        email: payload["email"],
        password: randomPassword,
        signupGoogle: true,
      });
      user
        .save()
        .then((user) => {
          res.json({
            message: "User Signup Successfully",
            user: user,
            token: newToken,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch(console.error);
};

const logout = (req, res, next) => {
  res.clearCookie("token");
};
const forgetUsername = (req, res, next) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "admin@gmail.com",
      pass: "123456",
    },
  });
  const email = req.body.email;
  const user = User.find((user) => user.email === email);
  if (!user) {
    return res.status(404).send("User not found");
  }
  transporter.sendMail(
    {
      from: "admin@gmail.com",
      to: email,
      subject: "So you wanna know your Reddit username, huh?",
      text: `Hi there,

        You forgot it didn't you? Hey, it happens. Here you go:
        
        Your username is ${user.username}
        
        (Username checks out, nicely done.)`,
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

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 }, // Expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

module.exports = { googleSignUp, login, forgetUsername };
