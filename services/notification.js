const Notification = require("../models/notification");
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");
const Subreddit = require("../models/subReddit");
const UserUploadModel = require("../models/userUploads");
require("dotenv").config();
var admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");

// const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const serviceAccount = require("../reddit-bylham-firebase-adminsdk-p32d0-be4d755618.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const notificationTemplate = {};
const sendNotification = async (
  username,
  senderUsername,
  post,
  comment,
  type
) => {
  const user = await User.findOne({ userName: username });
  const sender = await User.findOne({ userName: senderUsername });
  const userAvatar = await UserUploadModel.findById(user.avatarImage);
  const senderAvatar = await UserUploadModel.findById(sender.avatarImage);
  let affectedPost = null;
  let subreddit = null;
  let subredditAvatar = null;
  if (post) {
    console.log("ANA DA5EL HNAAAAA");
    affectedPost = await Post.findById(post);
    subreddit = await Subreddit.findById(affectedPost.subReddit);
    if (subreddit) {
      subredditAvatar = await UserUploadModel.findById(subreddit.avatarImage);
      if (subredditAvatar) {
        subredditAvatar = subredditAvatar.url;
      }
    }
  }
  let PostedComment = null;
  if (comment) {
    PostedComment = await Comment.findById(comment);
  }
  const fcmTokens = user.fcmTokens;
  console.log(fcmTokens);
  // Remove the redundant declaration and assignment of 'notification' variable
  let notification = null;
  switch (type) {
    case "upvotedPost":
      notificationTemplate.title = `${sender.userName} Upvoted Your Post`;
      notificationTemplate.body = "Check it out!";
      notification = await Notification.create({
        senderId: sender._id,
        senderName: sender.userName,
        senderAvatar: senderAvatar ? senderAvatar.url : null,
        receiverId: user._id,
        receiverName: user.userName,
        receiverAvatar: userAvatar ? userAvatar.url : null,
        subredditName: subreddit ? subreddit.name : null,
        subredditAvatar: subredditAvatar ? subredditAvatar : null,
        type: "upvotedPost",
        isRead: false,
      });
      await notification.save();
      break;
    case "downvotedPost":
      notificationTemplate.title = `${sender.userName} Downvoted Your Post`;
      notificationTemplate.body = "Check it out!";
      notification = await Notification.create({
        senderId: sender._id,
        senderName: sender.userName,
        senderAvatar: senderAvatar ? senderAvatar.url : null,
        receiverId: user._id,
        receiverName: user.userName,
        receiverAvatar: userAvatar ? userAvatar.url : null,
        subredditName: subreddit ? subreddit.name : null,
        subredditAvatar: subredditAvatar ? subredditAvatar : null,
        type: "upvotedPost",
        isRead: false,
      });
      await notification.save();
      break;
    case "followed":
      notificationTemplate.title = `${sender.userName} Followed YOU!!`;
      notificationTemplate.body = "Check it out!";
      notification = await Notification.create({
        senderId: sender._id,
        senderName: sender.userName,
        senderAvatar: senderAvatar ? senderAvatar.url : null,
        receiverId: user._id,
        receiverName: user.userName,
        receiverAvatar: userAvatar ? userAvatar.url : null,
        subredditName: subreddit ? subreddit.name : null,
        subredditAvatar: subredditAvatar ? subredditAvatar : null,
        type: "followed",
        isRead: false,
      });
      await notification.save();
      break;
    case "commentedPost":
      notificationTemplate.title = `${sender.userName} Commented on your Post!!`;
      notificationTemplate.body = `Title: ${affectedPost.title}!!`;
      notification = await Notification.create({
        senderId: sender._id,
        senderName: sender.userName,
        senderAvatar: senderAvatar ? senderAvatar.url : null,
        receiverId: user._id,
        receiverName: user.userName,
        receiverAvatar: userAvatar ? userAvatar.url : null,
        subredditName: subreddit ? subreddit.name : null,
        subredditAvatar: subredditAvatar ? subredditAvatar : null,
        type: "commentedPost",
        isRead: false,
      });
      await notification.save();
      break;
    default:
      // Handle unknown notification types
      break;
  }
  console.log(fcmTokens[0]);
  if (fcmTokens.length === 0) {
    return;
  }
  // let messageStr = {};
  const message = {
    notification: {
      title: notificationTemplate.title,
      body: notificationTemplate.body,
    },
    tokens: fcmTokens,
  };
  // console.log(serviceAccount);
  getMessaging()
    .sendEachForMulticast(message)
    .then((response) => {
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(
              "Failure sending notification to",
              fcmTokens[idx],
              resp.error
            );
            failedTokens.push(fcmTokens[idx]);
          }
        });
        // console.log("List of tokens that caused failures: " + failedTokens);
      }
      // console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      // console.error("Error sending message:", error);
    });
};

module.exports = { sendNotification };
// const FCM = require("fcm-node");
// const serverKey =
//   "AAAALBbAVsU: APA91bFiQNr3pmGfkdw2k7NgIokJqwE078vJec9 - jLMOdh-s80RRQs8sj9aXOWdqL";
// const fcm = new FCM(serverKey);
// const message = {
//   notification: {
//     title: "Notification Title",
//     body: "Notification Body",
//   },
//   to: "d25zGp4SRWCzxgEqrTcb_Q:APA91bGFK4jQ-tPsdL7Vv1QVEBuV0Gm09xjI3SY7C5uPbJMBr3i",
// };
// fcm.send(message, function (err, response) {
//   if (err) {
//     console.error("Error sending message:", err);
//   } else {
//     console.log("Successfully sent message:", response);
//   }
// });
