/**
 * src/utils/sendEmail.js
 * * UTILITY FUNCTION: A reusable helper to send emails.
 * By keeping this separate from the controller, we can easily use this exact
 * same function anywhere else in our app (e.g., sending welcome emails,
 * invoice receipts, or account deletion warnings).
 */

const nodemailer = require("nodemailer");

// We accept an 'options' object that will contain the dynamic parts of the email
// (recipient email, subject line, and the message body)
const sendEmail = async (options) => {
  // 1. CREATE THE TRANSPORTER
  // The transporter is essentially the "mail truck". It holds the configuration
  // telling Nodemailer exactly which SMTP server to connect to (e.g., Mailtrap, AWS SES, SendGrid)
  // and provides the username/password to authenticate.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  }); // 2. DEFINE THE EMAIL OPTIONS
  // This builds the actual "envelope" and "letter" that the mail truck will deliver.

  const mailOptions = {
    // Format: "Display Name <email@address.com>"
    from: `VIP Authentication System <${process.env.EMAIL_FROM}>`,
    to: options.email, // Where it is going
    subject: options.subject, // The subject line
    text: options.message, // The plain-text body of the email
  }; // 3. SEND THE EMAIL
  // This is an asynchronous action. It reaches out across the internet to your
  // email provider, hands off the letter, and waits for a success/failure receipt.

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
