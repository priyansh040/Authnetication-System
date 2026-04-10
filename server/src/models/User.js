/**
 * src/models/User.js
 * * DATA MODEL: This file defines the blueprint for a User in our database.
 * It strictly dictates what fields are required, what type of data they must be,
 * and handles automatic password hashing before saving data to MongoDB.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 1. SCHEMA DEFINITION
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Prevents duplicate accounts with the same email
      lowercase: true, // Sanitization: Automatically converts "User@Email.com" to "user@email.com"
    },
    password: {
      type: String,
      required: true,
    },
    // Used to issue new access tokens without requiring the user to log in again
    refreshToken: {
      type: String,
      default: null,
    },
    // Used for the "Forgot Password" flow. These are only populated when a reset is requested.
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  // Automatically adds 'createdAt' and 'updatedAt' timestamps to every document
  { timestamps: true },
);

// 2. PRE-SAVE MIDDLEWARE (Security Best Practice)
// This is an automatic trigger that runs EVERY TIME right before a user is saved to the database.
// By putting the hashing logic here, we ensure that a plain-text password can NEVER accidentally be saved,
// no matter where in the codebase the user was created or updated.
userSchema.pre("save", async function (next) {
  // If the user document is just being updated (e.g., changing their name)
  // but the password wasn't touched, skip the hashing process.
  // Otherwise, we would accidentally hash the already-hashed password!
  if (!this.isModified("password")) {
    return next(); // Proceed to the next step (saving to the DB)
  }

  // Generate a "salt" (a random string of characters) to make the hash mathematically unique
  const salt = await bcrypt.genSalt(10);

  // Replace the plain-text password with the scrambled, secure hash
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// 3. COMPILE AND EXPORT
// Compiles the schema into a usable Model named "User"
module.exports = mongoose.model("User", userSchema);
