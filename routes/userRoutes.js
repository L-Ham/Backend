const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bodyParser = require("body-parser");

router.get(
  "/accountSettings",
  bodyParser.json(),
  userController.getUserSettings
);

module.exports = router;
