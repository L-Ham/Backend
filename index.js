const express = require("express");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.connect(
  "mongodb+srv://ziadwareth:back%401234%40end@cluster0.eb6lrx8.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

//create a connection to the database
