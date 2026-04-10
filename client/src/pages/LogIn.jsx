/**
 * client/src/pages/Login.jsx
 * * LOGIN PAGE COMPONENT: This handles the user interface for authenticating.
 * It captures user credentials, sends them to the backend, and if successful,
 * extracts the security tokens and updates the global application state.
 */

import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const Login = () => {
  // --- COMPONENT STATE ---
  // We use state to track exactly what the user is typing in real-time.
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // Bring in the 'login' function from our global AuthContext (The Loudspeaker)
  const { login } = useContext(AuthContext);

  // React Router's hook to programmatically change the page
  const navigate = useNavigate();

  // --- EVENT HANDLERS ---

  // 1. Handle Input Changes
  // This clever function updates the specific piece of state (email or password)
  // based on the 'name' attribute of the input field the user is typing in.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop the browser from refreshing the page on submit
    setError(""); // Clear any old error messages before trying again

    try {
      // Step A: Send the credentials to the backend Traffic Cop
      // Notice we are using standard 'axios' here, NOT our custom interceptor,
      // because the user isn't logged in yet and doesn't have a token to attach!
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData,
      );

      // Step B: Extract the "Wristbands" from the backend response
      const token = response.data.accessToken; // 15-minute pass
      const refreshToken = response.data.refreshToken; // 7-day pass

      // Step C: Update Global State
      // This tells AuthContext to decode the token and broadcast to the rest
      // of the app that this user is officially logged in.
      login(token);

      // Step D: Save the long-term pass to browser storage
      // (AuthContext already saved the short-term one for us inside the login function)
      localStorage.setItem("refreshToken", refreshToken);

      // Step E: Redirect the user to the VIP Room
      navigate("/dashboard");
    } catch (err) {
      // If the backend throws a 401 Unauthorized, we catch the specific error message
      // (like "Invalid email or password") and display it safely to the user.
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  // --- RENDER UI ---
  return (
    <div className="container">
      <h2>Welcome Back</h2>

      {/* Conditional Rendering: Only show the error box if an error exists */}
      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
          required // HTML5 validation: prevents submitting an empty field
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <Link
          to="/forgot-password"
          style={{ fontSize: "14px", textAlign: "right", display: "block" }}
        >
          Forgot Password?
        </Link>

        <button type="submit">Log In</button>
      </form>

      <p>
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
};

export default Login;
