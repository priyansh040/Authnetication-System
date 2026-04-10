/**
 * src/routes/authRoutes.js
 * * THE TRAFFIC COP (ROUTER): This file maps specific URLs to their corresponding
 * business logic (Controllers). By keeping routes separate from controllers,
 * we maintain a clean, readable codebase (Best Practice #6: Modularity).
 */

const express = require("express");

// 1. IMPORT CONTROLLERS
// We bring in all the "brain" functions that actually handle the data.
const {
  signup,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// 2. IMPORT MIDDLEWARE
// We bring in our "Bouncer" to protect routes that require a logged-in user.
const { protect } = require("../middlewares/authMiddleware");

// Initialize the Express Router
const router = express.Router();

// 3. PUBLIC ROUTES
// Anyone on the internet can access these endpoints without needing a token.
router.post("/signup", signup); // Creates a new user
router.post("/login", login); // Verifies credentials and issues tokens
router.post("/refresh", refresh); // Exchanges a refresh token for a new access token
router.post("/forgot-password", forgotPassword); // Sends the password reset email

// 4. PROTECTED ROUTES
// Notice how we inject the `protect` middleware BEFORE the `logout` controller.
// If `protect` fails (no valid token), the request is rejected before `logout` ever runs.
router.post("/logout", protect, logout);

// 5. DYNAMIC ROUTES
// The `:token` syntax creates a dynamic URL parameter.
// If a user visits /reset-password/abc123xyz, Express captures "abc123xyz"
// and makes it available inside the controller as `req.params.token`.
// We use PUT here because we are UPDATING an existing resource (the password).
router.put("/reset-password/:token", resetPassword);

module.exports = router;
