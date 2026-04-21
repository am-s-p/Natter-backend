const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { getUsers, searchUsers, getContacts } = require("../controllers/user.controller");

router.get("/", getUsers);
router.get("/search", auth, searchUsers);
router.get("/contacts", auth, getContacts);

module.exports = router;