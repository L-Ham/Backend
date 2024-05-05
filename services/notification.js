const Notification = require("../models/notification");
const User = require("../models/user");
const Post = require("../models/post");
const Subreddit = require("../models/subReddit");
const UserUploadModel = require("../models/userUploads");
require("dotenv").config();
var admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const notificationTemplate = {};

const sendNotification = async (username, senderUsername, post, type) => {
  const user = await User.findOne({ userName: username });
  const sender = await User.findOne({ userName: senderUsername });
  const userAvatar = await UserUploadModel.findById(user.avatarImage);
  const senderAvatar = await UserUploadModel.findById(sender.avatarImage);
  let affectedPost = null;
  let subreddit = null;
  if (post) {
    affectedPost = await Post.findById(post);
    subreddit = await Subreddit.findById(affectedPost.subReddit);
  }
  const fcmTokens = user.fcmTokens;
  console.log(fcmTokens);
  // Remove the redundant declaration and assignment of 'notification' variable
  let notification = null;
  switch (type) {
    case "upvotedPost":
      notificationTemplate.title = `${sender.userName} upvoted your post`;
      notificationTemplate.body = "Check it out!";
      notification = await Notification.create({
        senderId: sender._id,
        senderName: sender.userName,
        senderAvatar: senderAvatar ? senderAvatar.url : null,
        receiverId: user._id,
        receiverName: user.userName,
        receiverAvatar: userAvatar ? userAvatar.url : null,
        subredditName: subreddit ? subreddit.name : null,
        type: "upvotedPost",
        isRead: false,
      });
      await notification.save();
      break;
    case "downvotedPost":
      notificationTemplate.title = `${sender.userName} downvoted your post`;
      notificationTemplate.body = "Check it out!";
      notification = await Notification.create({
        senderId: sender._id,
        senderName: sender.userName,
        senderAvatar: senderAvatar ? senderAvatar.url : null,
        receiverId: user._id,
        receiverName: user.userName,
        receiverAvatar: userAvatar ? userAvatar.url : null,
        subredditName: subreddit ? subreddit.name : null,
        type: "upvotedPost",
        isRead: false,
      });
      await notification.save();
      break;
    default:
      // Handle unknown notification types
      break;
  }
  console.log("A77777AAAAAAA");
  console.log(fcmTokens[0]);
  if (fcmTokens.length === 0) {
    return;
  }
  // if (type === "upvotedPost") {
  //   notificationTemplate.title = `${from} upvoted your post`;
  //   notificationTemplate.body = "Check it out!";
  // }
  let messageStr = {};

  // const notification = new Notification({
  //   type: type,
  //   message: messageStr,
  // });
  // await notification.save();
  const message = {
    notification: {
      title: notificationTemplate.title,
      body: notificationTemplate.body,
    },
    tokens: fcmTokens,
  };
  console.log(serviceAccount);
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
