const User = require("../models/user");
const Notification = require("../models/notification");

const getUserNotifications = async (req, res) => {
  const userId = req.userId;
  const limit = req.query.limit;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    let query = Notification.find({ receiverId: userId }).sort({
      createdAt: -1,
    });
    if (limit) {
      query = query.limit(Number(limit));
    }
    const notifications = await query;
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({
      message: "Error Retrieving User Notifications",
      error: error.message,
    });
  }
};

const readNotification = async (req, res) => {
  const notificationId = req.body.notificationId;
  const userId = req.userId;
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification Not Found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    if (notification.isRead) {
      return res
        .status(400)
        .json({ message: "Notification Already Marked as Read" });
    }
    if (notification.receiverId.toString() !== userId) {
      return res
        .status(401)
        .json({ message: "This notification wasn't sent to this user" });
    }
    notification.isRead = true;
    await notification.save();
    return res
      .status(200)
      .json({ message: "Notification Marked as Read Successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error Marking Notification as Read",
      error: error.message,
    });
  }
};

const readAllNotifications = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    await Notification.updateMany(
      {
        receiverId: userId,
      },
      { isRead: true }
    );
    return res
      .status(200)
      .json({ message: "All Notifications Marked as Read Successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error Marking All Notifications as Read",
      error: error.message,
    });
  }
};

const hideNotification = async (req, res) => {
  const notificationId = req.body.notificationId;
  const userId = req.userId;
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification Not Found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    if (notification.receiverId.toString() !== userId) {
      return res
        .status(401)
        .json({ message: "This notification wasn't sent to this user" });
    }
    await Notification.findByIdAndDelete(notificationId);
    return res
      .status(200)
      .json({ message: "Notification Hidden Successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error Hiding Notification",
      error: error.message,
    });
  }
};
module.exports = {
  getUserNotifications,
  readNotification,
  readAllNotifications,
  hideNotification,
};
