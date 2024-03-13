const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const PORT = 5000;

mongoose
  .connect(
    "mongodb+srv://ziadwareth:back%401234%40end@cluster0.eb6lrx8.mongodb.net/"
  )
  .then((result) => {
    console.log("Connected to the database");
    app.listen(
      PORT,
      (req, res, next) => {
        console.log(`Server running on port ${PORT}`);
        // app.get("/", function (req, res) {
        //   res.send("Hello World!");
      }
      // });
    );
  })
  .catch((err) => console.log(err));
