const express = require("express");
const router = express.Router();
const userController = require("../controllers/subredditController");
const bodyParser = require("body-parser");


router.get(
    "/sorting",
    bodyParser.json(),
    subRedditController.sorting
);