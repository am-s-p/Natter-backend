const User = require("../models/user.model");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("_id username");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};