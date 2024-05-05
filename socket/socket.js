// const Server = require("socket.io").Server;
// const http = require("http");
// const express = require("express");

// const app = express();

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   },
// });

// const getReceiverSocketId = (receiverId) => {
//   console.log("GOWAA EL SCOKET");
//   console.log(userSocketMap[receiverId]);
//   console.log(userSocketMap);
//   return userSocketMap[receiverId];
// };

// const userSocketMap = {}; // {userId: socketId}

// io.on("connection", (socket) => {
//   console.log("a user connected", socket.id);

//   const userId = socket.handshake.query.userId;
//   if (userId != "undefined") userSocketMap[userId] = socket.id;

//   // io.emit() is used to send events to all the connected clients
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   // socket.on() is used to listen to the events. can be used both on client and server side
//   socket.on("disconnect", () => {
//     console.log("user disconnected", socket.id);
//     delete userSocketMap[userId];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// module.exports = { app, io, server, getReceiverSocketId };
// import { stat } from "fs";
// import jwt from "jsonwebtoken";

const Server = require("socket.io").Server;
const http = require("http");
const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken"); // You forgot to import jwt

// This line creates a new Express application.
const app = express();

// This line creates a new HTTP server that uses the Express application.
// const socketPort = 3001;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// This object maps user IDs to socket IDs.
// It's used to keep track of which socket belongs to which user.
const userSocketMap = {}; // {user_id: socketId}

// This function is exported so it can be used in other files.
// It takes a receiverId and returns the corresponding socket ID from userSocketMap.
const getReceiverSocketId = (receiverId) => {
  console.log(userSocketMap);
  console.log("GOWAA EL SCOKET");
  console.log(userSocketMap[receiverId]);
  return userSocketMap[receiverId];
};

io.on("connection", async (socket) => {
  console.log("a user connected", socket.id);

  // Extract the token from the query parameter.
  const token = socket.handshake.query.token.split(" ")[1];

  // Verify the token.
  let user_token;

  try {
    user_token = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log({
      err: { status: 401, message: `Invalid Token: ${err.message}` },
    }); // Template literals were missing
    return; // If token is invalid, return from the function
  }

  // Get the user id from the token.
  const user_id = user_token._id;

  // Get the user from the id.
  const user = await User.findById(user_id);

  if (!user) {
    console.log({ err: { status: 404, message: "User not found" } });
    return; // If user is not found, return from the function
  } else {
    userSocketMap[user_id] = socket.id;
  }

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[user_id];
  });
});
// server.listen(socketPort, () => {
//   // Start the Socket.IO server on port 3005
//   console.log(`Socket.IO server running on port ${socketPort}...`);
// });
module.exports = { app, io, server, getReceiverSocketId }; // Use module.exports for Node.js
