
const { io } = require("socket.io-client");

const socket = io("http://localhost:5005", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWUxZGUxZDcxNThkYmIyMDIwY2ViODIiLCJpYXQiOjE3NzY0MTExMjksImV4cCI6MTc3NzAxNTkyOX0.1SQgN_oq-tTiyEQE6Y6Mu27rnHRALEUdd_Y1Sv_SepM",
  },
});

socket.on("connect", () => {
  console.log("User1 Connected:", socket.id);

  // send message after 2 seconds
  setTimeout(() => {
    socket.emit("sendMessage", {
      receiverId: "69e1de257158dbb2020ceb85",
      content: "Hello from User1 🚀",
    });
  }, 2000);
});

socket.on("receiveMessage", (msg) => {
  console.log("User1 received:", msg);
});