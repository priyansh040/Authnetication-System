/**
 * src/config/db.js
 * * DATABASE CONFIGURATION: This file handles the connection to MongoDB.
 * It is separated from server.js to keep our codebase modular and clean.
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  // 1. ERROR HANDLING (Best Practice #1)
  // Connecting to a database takes time (it's asynchronous).
  // We wrap it in a try/catch block so if the database is down, our app doesn't just crash silently.
  try {
    // 2. ENVIRONMENT VARIABLES (Best Practice #2)
    // We use process.env.MONGO_URI instead of hardcoding the database URL.
    // This ensures our database password is never pushed to GitHub.
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If successful, log the host we connected to (helps verify if we are on local dev or cloud prod)
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If the connection fails, log the specific error message
    console.error(`Database Connection Error: ${error.message}`);

    // 3. FAIL FAST
    // process.exit(1) tells the Node.js application to shut down completely.
    // If our backend cannot connect to the database, it cannot do its job.
    // It is safer to shut the server down than to leave a broken server running.
    process.exit(1);
  }
};

module.exports = connectDB;
