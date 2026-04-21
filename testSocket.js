const { io } = require("socket.io-client");

const socket = io("http://localhost:5005", {
  auth: {
    token: "PASTE_YOUR_JWT_TOKEN_HERE",
  },
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("sendMessage", {
    receiverId: "OTHER_USER_ID",
    content: "Hello from Natter 🚀",
  });
});

socket.on("receiveMessage", (msg) => {
  console.log("Message received:", msg);
});