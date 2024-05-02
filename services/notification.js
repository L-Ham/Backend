const Notification = require("../models/notification");
const User = require("../models/user");
var admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const notificationTemplate = {};

const sendNotification = async (username, type, from) => {
  const user = await User.findOne({ userName: username });
  // const fcmToken = user.fcmToken;
  // console.log(fcmToken);
  //   if (fcmToken.length === 0) {
  //     return;
  //   }

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
    tokens: fcmToken,
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
