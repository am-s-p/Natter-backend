const { io } = require("socket.io-client");

const socket = io("http://localhost:5005", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWUxZGUyNTcxNThkYmIyMDIwY2ViODUiLCJpYXQiOjE3NzY0MTA1NTQsImV4cCI6MTc3NzAxNTM1NH0.QW3yZaC7mnEUeQJVAHPZBnh_WQzL1G2YmkABcEa7DB8",
  },
});

socket.on("connect", () => {
  console.log("User2 Connected:", socket.id);
});

socket.on("receiveMessage", (msg) => {
  console.log("User2 received:", msg);
});