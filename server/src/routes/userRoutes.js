const express = require("express");
const { getUserProfile } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware"); // Import our Bouncer

const router = express.Router();

// When a GET request hits /profile, it must pass through 'protect' FIRST.
// If 'protect' fails, it never reaches 'getUserProfile'.
router.get("/profile", protect, getUserProfile);

module.exports = router;
