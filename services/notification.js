const Notification = require("../models/notification");
const User = require("../models/user");
var admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const notificationTemplate = {};

const sendNotification = async (username, type) => {
  const user = await User.findOne({ userName: username });
  const fcmTokens = user.fcmTokens;
  console.log(fcmTokens);
  if (fcmTokens.length === 0) {
    return;
  }
  if (type === "upvotedPost") {
    notificationTemplate.title = `${from} upvoted your post`;
    notificationTemplate.body = "Check it out!";
  }
  let messageStr = {};
  if (type === "upvotedPost") {
    console.log("upvotedPost");
  }
  const notification = new Notification({
    type: type,
    message: messageStr,
  });
  await notification.save();
  const message = {
    notification: {
      title: messageStr.title,
      body: messageStr.body,
    },
    tokens: fcmTokens,
  };

  getMessaging()
    .sendEachForMulticast(message)
    .then((response) => {
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(
              "Failure sending notification to",
              fcmToken[idx],
              resp.error
            );
            failedTokens.push(fcmToken[idx]);
          }
        });
        console.log("List of tokens that caused failures: " + failedTokens);
      }
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
};

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
