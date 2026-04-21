const Message = require("../models/message.model");
const mongoose = require("mongoose");

exports.getMessages = async (req, res) => {
  try {
    const myId = new mongoose.Types.ObjectId(req.user.userId);
    const otherId = new mongoose.Types.ObjectId(req.params.userId);

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherId },
        { sender: otherId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "File upload failed" });
  }
};