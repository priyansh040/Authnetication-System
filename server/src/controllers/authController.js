/**
 * src/controllers/authController.js
 * * THE BRAIN (CONTROLLERS): This file contains the business logic for authentication.
 * It handles data validation, database queries, password comparison, token generation,
 * and password recovery.
 */

const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const User = require("../models/User");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. DATA VALIDATION SCHEMAS (Best Practice #3)
// We define strict rules for incoming data. If a user tries to send a 2-character
// password or a malformed email, Joi will block it before it ever touches our database.
const signupSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// --- SIGNUP CONTROLLER ---
const signup = async (req, res, next) => {
  try {
    // Step 1: Validate the incoming request body against our schema
    const { error } = signupSchema.validate(req.body);
    if (error) {
      res.status(400); // 400 Bad Request
      throw new Error(error.details[0].message);
    }

    const { name, email, password } = req.body;

    // Step 2: Check for existing users to prevent duplicate accounts
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409); // 409 Conflict
      throw new Error("A user with this email already exists");
    }

    // Step 3: Create the user.
    // * MAGIC MOMENT: Because of our `pre-save` hook in the User model,
    // the password is automatically hashed right here before it enters the database!
    const user = await User.create({
      name,
      email,
      password,
    });

    // Step 4: Send success response (Notice we NEVER send the password back!)
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
};

// --- LOGIN CONTROLLER ---
const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const { email, password } = req.body;

    // Step 1: Find the user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401); // 401 Unauthorized
      throw new Error("Invalid email or password"); // Generic message for security
    }

    // Step 2: Verify the password
    // bcrypt securely compares the plain-text password to the hashed string in the DB
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    // Step 3: Generate the "Wristbands" (Tokens)
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
    );

    // Step 4: Save the refresh token to the database so we can track the session
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// --- REFRESH TOKEN CONTROLLER ---
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401);
      throw new Error("No refresh token provided");
    }

    // Step 1: Verify the token hasn't been tampered with and hasn't expired
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Step 2: Find the user and ensure the token matches the one in our vault
    // This prevents stolen, old refresh tokens from being used.
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      res.status(403); // 403 Forbidden
      throw new Error("Invalid refresh token");
    }

    // Step 3: Issue a fresh, new 15-minute Access Token
    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
    );

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

// --- LOGOUT CONTROLLER ---
const logout = async (req, res, next) => {
  try {
    // Step 1: req.user is provided by our `protect` middleware!
    const user = await User.findById(req.user.userId);

    // Step 2: Erase the refresh token from the database.
    // This officially ends the user's 7-day session.
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// --- FORGOT PASSWORD CONTROLLER ---
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error("There is no user with that email");
    }

    // Step 1: Generate a random 20-character hexadecimal string
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Step 2: Hash the token BEFORE saving it to the DB.
    // If the database is hacked, the hackers can't use the raw token to reset passwords.
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Expires in exactly 15 mins
    await user.save();

    // Step 3: Build the URL that we will email to the user
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. \n\n Please click on the following link, or paste it into your browser to complete the process:\n\n ${resetUrl} \n\n If you did not request this, please ignore this email and your password will remain unchanged.`;

    try {
      // Step 4: Send the email
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        message: message,
      });

      res.status(200).json({
        success: true,
        message: "Password reset link sent to email",
      });
    } catch (err) {
      console.error("NODEMAILER ERROR:", err);
      // ROLLBACK: If the email fails to send, erase the token so it's not left vulnerable
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(500);
      throw new Error("Email could not be sent. Please try again later.");
    }
  } catch (error) {
    next(error);
  }
};

// --- RESET PASSWORD CONTROLLER ---
const resetPassword = async (req, res, next) => {
  try {
    // Step 1: Re-hash the token from the URL so it matches the format in our database
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Step 2: Find a user with this hashed token WHERE the expiration date is still in the future ($gt = greater than)
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error("Invalid or expired reset token");
    }

    // Step 3: Set the new password.
    // * MAGIC MOMENT 2: Our `pre-save` hook in the User model will see this password has changed and hash it for us automatically!
    user.password = req.body.password;

    // Step 4: Clean up the one-time-use token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
