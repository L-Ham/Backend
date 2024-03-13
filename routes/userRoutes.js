const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bodyParser = require("body-parser");

router.get("/signup", bodyParser.json(), userController.signUp);
