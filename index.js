const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const multerConfig = require("./middleware/multerConfig");
const cors = require("cors");
const { app, server } = require("./socket/socket.js");

const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
mongoose
  .connect(
    "mongodb+srv://ziadwareth:back%401234%40end@cluster0.eb6lrx8.mongodb.net/"
  )
  .then((result) => {
    console.log("Connected to the database");
    server.listen(PORT, (req, res, next) => {
      console.log(`Server running on port ${PORT}`);
      const userRoutes = require("./routes/userRoutes");
      const authRoutes = require("./routes/authRoutes");
      const postRoutes = require("./routes/postRoutes");
      const commentRoutes = require("./routes/commentRoutes");
      const subredditRoutes = require("./routes/subredditRoutes");
      const messageRoutes = require("./routes/messageRoutes");
      const conversationRoutes = require("./routes/conversationRoutes");
      const chatRoutes = require("./routes/chatRoutes");
      const notificationRoutes = require("./routes/notificationRoutes");

      app.use("/user", userRoutes);
      app.use("/auth", authRoutes);
      app.use("/post", postRoutes);
      app.use("/comment", commentRoutes);
      app.use("/subreddit", subredditRoutes);
      app.use("/message", messageRoutes);
      app.use("/conversation", conversationRoutes);
      app.use("/chat", chatRoutes);
      app.use("/notification", notificationRoutes);

      app.get("/", function (req, res) {
        res.send("Hello World!");
      });
    });
  })
  .catch((err) => console.log(err));
