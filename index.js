const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const multerConfig = require("./middleware/multerConfig");
const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cookieParser());
mongoose
  .connect(
    "mongodb+srv://ziadwareth:back%401234%40end@cluster0.eb6lrx8.mongodb.net/"
  )
  .then((result) => {
    console.log("Connected to the database");
    app.listen(PORT, (req, res, next) => {
      console.log(`Server running on port ${PORT}`);
      const userRoutes = require("./routes/userRoutes");
      const authRoutes = require("./routes/authRoutes");
      const socialLinkRoutes = require("./routes/socialLinkRoutes");
      const postRoutes = require("./routes/postRoutes");
      const commentRoutes = require("./routes/commentRoutes");
      const subredditRoutes = require("./routes/subredditRoutes");
      app.use("/user", userRoutes);
      app.use("/auth", authRoutes);
      app.use("/socialLink", socialLinkRoutes);
      app.use("/post", postRoutes);
      app.use("/comment", commentRoutes);
      app.use("/subreddit", subredditRoutes);
      app.get("/", function (req, res) {
        res.send("Hello World!");
      });
    });
  })
  .catch((err) => console.log(err));
