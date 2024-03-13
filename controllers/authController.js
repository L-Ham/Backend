const User = require("../models/user"); // Import User model
const nodemailer = require('nodemailer'); // Email sending

const forgetUsername = (req, res, next) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'admin@gmail.com',
          pass: '123456'
        }
      });
    const email  = req.body.email;
    const user = User.find(user => user.email === email);
    if (!user) {
        return res.status(404).send("User not found");
    }
    transporter.sendMail({
        from: 'admin@gmail.com',
        to: email,
        subject: 'So you wanna know your Reddit username, huh?',
        text: `Hi there,

        You forgot it didn't you? Hey, it happens. Here you go:
        
        Your username is ${user.username}
        
        (Username checks out, nicely done.)`
      }, (err) => {
        if (err) {
          console.error('Error sending email:', err);
          return res.status(500).send('Failed to send email');
        }
        res.send('Email sent');
      });

  };

  module.exports = {
    forgetUsername
  };