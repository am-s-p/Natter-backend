const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const chatRoutes = require("./routes/chat.routes");

// Fix: Route must come AFTER cors and express.json
const app = express();
//const cors = require("cors");

app.use(cors({
  origin: "*", // later replace with frontend URL
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Natter API Running...");
});

module.exports = app;