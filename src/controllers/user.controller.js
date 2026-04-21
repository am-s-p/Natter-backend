const User = require("../models/user.model");
const Message = require("../models/message.model");
const mongoose = require("mongoose");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("_id username");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Search users by username
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const users = await User.find({
      username: { $regex: q, $options: "i" },
      _id: { $ne: req.user.userId }
    }).select("_id username").limit(10);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👥 Get users with existing chat history
exports.getContacts = async (req, res) => {
  try {
    const myId = new mongoose.Types.ObjectId(req.user.userId);

    // Find unique user IDs from messages (as sender or receiver)
    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: myId }, { receiver: myId }]
        }
      },
      {
        $project: {
          user: {
            $cond: { if: { $eq: ["$sender", myId] }, then: "$receiver", else: "$sender" }
          }
        }
      },
      {
        $group: { _id: "$user" }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails"
      },
      {
        $project: {
          _id: "$userDetails._id",
          username: "$userDetails.username"
        }
      }
    ]);

    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};