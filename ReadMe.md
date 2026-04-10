# 🔐 MERN Full-Stack Authentication System

A production-ready, full-stack authentication and authorization system built with the MERN stack (MongoDB, Express, React, Node.js).

This project demonstrates a highly secure, modern approach to user authentication, featuring a dual-token architecture (Access & Refresh tokens), silent session renewal, and automated password recovery.

## ✨ Key Features

- **Advanced JWT Authentication:** Utilizes short-lived Access Tokens (15 minutes) and long-lived Refresh Tokens (7 days) to balance security with user experience.
- **Silent Token Refresh:** Custom Axios interceptors automatically detect expired sessions and renew tokens in the background without kicking the user out.
- **Secure Password Recovery:** Complete "Forgot Password" flow utilizing expiring cryptographic tokens and Nodemailer for email delivery.
- **Robust Security:** Implements Bcrypt password hashing, Helmet for secure HTTP headers, and strict CORS policies.
- **Global React State:** Uses React's Context API to manage user state seamlessly across the entire frontend application.
- **Protected Routes:** React Router securely guards dashboard and VIP components against unauthenticated access.

## 🛠️ Tech Stack

**Frontend:**

- React.js (Vite)
- React Router DOM
- Axios (Custom Instances & Interceptors)
- Context API

**Backend:**

- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- Bcrypt.js
- Nodemailer

## 📁 Folder Structure

This repository uses a monorepo structure, separating the frontend and backend into distinct directories:

- `/client` - Contains the React frontend application.
- `/server` - Contains the Node.js/Express backend API.

## 🚀 Getting Started

Follow these instructions to run the project locally on your machine.

### Prerequisites

- Node.js installed
- A free MongoDB Atlas cluster (or local MongoDB database)
- A free Mailtrap account (for testing email delivery)

### 1. Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a .env file in the server directory and add your environment variables:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Mailtrap)

EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_password
EMAIL_FROM=noreply@authsystem.com

# Frontend Setup

Open a new terminal, navigate to the client directory, and install dependencies:

cd client
npm install
Start the React development server:

npm run dev
