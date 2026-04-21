const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: String,
    isRead: { type: Boolean, default: false },
    attachment: {
      url: String,
      fileType: String,
      fileName: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);