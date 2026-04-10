/**
 * client/src/pages/ResetPassword.jsx
 * * PASSWORD RESET COMPONENT: This is the final step in the recovery flow.
 * It captures the unique token from the URL (sent via email), allows the user
 * to input a new password, and securely updates their credentials in the database.
 */

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  // --- COMPONENT STATE ---
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // Holds the success message from the backend
  const [error, setError] = useState("");

  // --- ROUTING HOOKS ---
  // useParams is the magic hook here!
  // Because our App.jsx defined this route as "/reset-password/:token",
  // this hook reaches up into the browser's URL bar and extracts that specific token string.
  const { token } = useParams();

  // Used to programmatically send the user to the login page after success
  const navigate = useNavigate();

  // --- EVENT HANDLERS ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any old messages before trying a new submission
    setMessage("");
    setError("");

    try {
      // Step A: Send the new password to the backend.
      // Notice we are passing the 'token' directly into the URL string so the
      // backend Traffic Cop can catch it with req.params.token!
      // We use 'put' because we are updating an existing user record.
      const response = await axios.put(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password },
      );

      // Step B: Display the success message ("Password has been updated successfully")
      setMessage(response.data.message);

      // Step C: The UX Bonus
      // Instead of jarringly kicking them to the login screen instantly,
      // we let them read the green success message for exactly 3 seconds (3000ms),
      // and THEN automatically redirect them.
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      // If the token is fake, or if it has been more than 15 minutes since they
      // clicked "Forgot Password", the backend will throw an error here.
      setError(err.response?.data?.message || "Invalid or expired token");
    }
  };

  // --- RENDER UI ---
  return (
    <div className="container">
      <h2>Create New Password</h2>

      {/* SUCCESS MESSAGE UI */}
      {/* Inline styles are used here for a quick, nice-looking green success box */}
      {message && (
        <div
          style={{
            color: "green",
            marginBottom: "16px",
            padding: "10px",
            backgroundColor: "#e6f4ea",
            borderRadius: "6px",
          }}
        >
          {message}
        </div>
      )}

      {/* ERROR MESSAGE UI */}
      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6" // Enforces our Joi backend rules on the frontend
        />
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
