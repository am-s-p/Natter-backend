const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { getMessages, uploadFile } = require("../controllers/chat.controller");
const multer = require("multer");
const path = require("path");

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.get("/:userId", auth, getMessages);
router.post("/upload", auth, upload.single("file"), uploadFile);

module.exports = router;