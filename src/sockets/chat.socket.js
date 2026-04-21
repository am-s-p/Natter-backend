const jwt = require("jsonwebtoken");
const Message = require("../models/message.model");
const { pubClient, subClient } = require("../config/redis");
const {
  addUser,
  removeUser,
  getSocket,
} = require("../utils/socketManager");

module.exports = (io) => {
  // 🔐 AUTH
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  // 🔁 SUBSCRIBE ONLY ONCE
  subClient.subscribe("chat", (msg) => {
  const data = JSON.parse(msg);

  const receiverSocket = getSocket(data.receiver);
  const senderSocket = getSocket(data.sender);

  // send to receiver
  if (receiverSocket) {
    io.to(receiverSocket).emit("receiveMessage", data);
  }

  // 🔥 ALSO send back to sender (VERY IMPORTANT)
  if (senderSocket) {
    io.to(senderSocket).emit("receiveMessage", data);
    }
  });

  // 🔁 SUBSCRIBE TO READ RECEIPTS
  subClient.subscribe("readReceipt", (msg) => {
    const data = JSON.parse(msg);
    const senderSocket = getSocket(data.senderId);
    
    // Notify the user who sent the messages that they were read
    if (senderSocket) {
      io.to(senderSocket).emit("messagesRead", { readerId: data.readerId });
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    addUser(socket.userId, socket.id);

    // 💬 SEND MESSAGE
    socket.on("sendMessage", async ({ receiverId, content, attachment }) => {
      try {
        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          content,
          attachment,
        });

        // 🔥 publish FULL message (IMPORTANT)
        await pubClient.publish("chat", JSON.stringify(message));

      } catch (err) {
        console.error("Message error:", err);
      }
    });

    // ⌨️ typing
    socket.on("typing", ({ receiverId }) => {
      const receiverSocketId = getSocket(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", {
          sender: socket.userId,
        });
      }
    });

    // ✨ MARK AS READ
    socket.on("markAsRead", async ({ senderId }) => {
      try {
        // Update all unread messages sent by `senderId` to this user (`socket.userId`)
        await Message.updateMany(
          { sender: senderId, receiver: socket.userId, isRead: false },
          { $set: { isRead: true } }
        );

        // Publish to Redis so it reaches the sender's socket process
        await pubClient.publish("readReceipt", JSON.stringify({
          senderId: senderId,
          readerId: socket.userId 
        }));
      } catch (err) {
        console.error("markAsRead error:", err);
      }
    });

    socket.on("disconnect", () => {
      removeUser(socket.id);
    });
  });
};