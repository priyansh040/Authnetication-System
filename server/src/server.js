/**
 * src/server.js
 * * ENTRY POINT: This is the main file that starts our Express backend.
 * It configures environment variables, connects to the database,
 * sets up global security and routing middlewares, and starts the server.
 */

// Override default DNS servers (Optional but helpful!)
// Sometimes corporate networks or local ISPs block MongoDB Atlas connections.
// This forces Node to use Cloudflare (1.1.1.1) and Google (8.8.8.8) to resolve URLs safely.
const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// 1. ENVIRONMENT CONFIGURATION (Best Practice #2)
// MUST BE FIRST: Load variables from the .env file into process.env
// so the rest of the application can access secret keys and database URIs.
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

// Import Route Definitions
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// Initialize the Express Application
const app = express();

// 2. DATABASE CONNECTION
// Establish connection to MongoDB before handling any requests
connectDB();

// 3. GLOBAL MIDDLEWARES
// Middlewares are functions that run on EVERY incoming request before hitting the routes.

// Security headers (Best Practice #4): Protects against common web vulnerabilities (XSS, clickjacking)
app.use(helmet());

// CORS (Cross-Origin Resource Sharing): Defines who is allowed to talk to our API
app.use(
  cors({
    origin: "http://localhost:5173", // Only allow requests from our React frontend
    credentials: true, // Required if we eventually use HTTP-only cookies
  }),
);

// Body Parser: Tells Express to intercept requests and parse incoming JSON data into req.body
app.use(express.json());

// 4. ROUTE MOUNTING (Best Practice #6: Separation of Concerns)
// Route all traffic starting with '/api/auth' to the authRoutes file
app.use("/api/auth", authRoutes);
// Route all traffic starting with '/api/users' to the userRoutes file
app.use("/api/users", userRoutes);

// 5. HEALTH CHECK ROUTE
// A simple endpoint used by deployment platforms (like AWS/Render) to verify the server is alive
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Server is running smoothly!" });
});

// 6. GLOBAL ERROR HANDLER (Best Practice #1)
// IMPORTANT: This must be the VERY LAST middleware.
// If any route above throws an error, it gets caught here instead of crashing the server.
app.use(errorHandler);

// 7. START THE SERVER
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 8. GRACEFUL SHUTDOWN (Best Practice #9)
// Catches termination signals (like pressing Ctrl+C or a Docker container shutting down)
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

function gracefulShutdown() {
  console.log("\nReceived kill signal, shutting down gracefully...");
  // Stops the server from accepting new requests, finishes active requests, then exits cleanly.
  server.close(() => {
    console.log("Closed out remaining connections.");
    process.exit(0);
  });
}
