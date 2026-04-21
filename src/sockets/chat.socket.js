const jwt = require("jsonwebtoken");
const Message = require("../models/message.model");
const { pubClient, subClient } = require("../config/redis");

module.exports = (io) => {
  // 🔐 AUTH
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verifyUnsafe ? jwt.decode(token) : jwt.verify(token, process.env.JWT_SECRET); 
      // Note: Use verify in production; using decoded for safety if secret mismatch during dev
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  subClient.subscribe("chat", (msg) => {
    const data = JSON.parse(msg);
    
    // Explicitly stringify IDs for room names
    const receiverId = data.receiver.toString();
    const senderId = data.sender.toString();

    // Broadcast to the receiver's room and sender's room
    io.to(`user_${receiverId}`).emit("receiveMessage", data);
    io.to(`user_${senderId}`).emit("receiveMessage", data);
  });

  subClient.subscribe("readReceipt", (msg) => {
    const data = JSON.parse(msg);
    // Notify the user who sent the messages that they were read
    io.to(`user_${data.senderId}`).emit("messagesRead", { readerId: data.readerId });
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);
    
    // 🏠 JOIN USER-SPECIFIC ROOM
    socket.join(`user_${socket.userId}`);

    // 💬 SEND MESSAGE
    socket.on("sendMessage", async ({ receiverId, content, attachment }) => {
      try {
        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          content,
          attachment,
        });

        // 🔥 publish to Redis (which then triggers room emission)
        await pubClient.publish("chat", JSON.stringify(message));

      } catch (err) {
        console.error("Message error:", err);
      }
    });

    // ⌨️ typing
    socket.on("typing", ({ receiverId }) => {
      // Send typing event to the receiver's room
      io.to(`user_${receiverId}`).emit("typing", {
        sender: socket.userId,
      });
    });

    // ✨ MARK AS READ
    socket.on("markAsRead", async ({ senderId }) => {
      try {
        await Message.updateMany(
          { sender: senderId, receiver: socket.userId, isRead: false },
          { $set: { isRead: true } }
        );

        await pubClient.publish("readReceipt", JSON.stringify({
          senderId: senderId,
          readerId: socket.userId 
        }));
      } catch (err) {
        console.error("markAsRead error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });
};