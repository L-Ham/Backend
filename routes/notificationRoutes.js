const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const authenticateToken = require("../middleware/authenticateToken");
const notificationController = require("../controllers/notificationController");

router.get(
  "/user",
  bodyParser.json(),
  authenticateToken,
  notificationController.getUserNotifications
);

router.patch(
  "/markRead",
  bodyParser.json(),
  authenticateToken,
  notificationController.readNotification
);

router.patch(
  "/markAllRead",
  bodyParser.json(),
  authenticateToken,
  notificationController.readAllNotifications
);
module.exports = router;
