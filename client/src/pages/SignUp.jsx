/**
 * client/src/pages/Signup.jsx
 * * SIGNUP PAGE COMPONENT: This handles the user interface for registration.
 * It captures the user's desired credentials, sends them to our backend for
 * database creation, and seamlessly redirects them to the login flow upon success.
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  // --- COMPONENT STATE ---
  // Tracks exactly what the user is typing into the form fields.
  // We initialize it with empty strings so React knows these are controlled inputs.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Tracks any error messages returned from the backend (like "Email already exists")
  const [error, setError] = useState("");

  // React Router's hook to programmatically redirect the user to a new page
  const navigate = useNavigate();

  // --- EVENT HANDLERS ---

  // 1. Handle Input Changes
  // This dynamically updates the correct piece of state based on the input's 'name' attribute.
  // The spread operator (...formData) ensures we don't accidentally overwrite the other fields!
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the default HTML form behavior (which reloads the page)
    setError(""); // Clear previous errors

    try {
      // Step A: Send the registration data to the backend Traffic Cop.
      // Notice we use standard 'axios' here (not our custom 'api' interceptor)
      // because a brand new user definitely doesn't have an access token yet!
      await axios.post("http://localhost:5000/api/auth/signup", formData);

      // Step B: Success!
      // We don't log them in automatically here (though some apps do).
      // Instead, we force them to go through the official Login flow to get their tokens.
      navigate("/login");
    } catch (err) {
      // Step C: Failure Handling
      // If the backend throws an error (e.g., 409 Conflict because the email is taken),
      // we catch it and display the backend's exact error message to the user.
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  // --- RENDER UI ---
  return (
    <div className="container">
      <h2>Create an Account</h2>

      {/* Conditional Rendering: Only display the error banner if the 'error' state has text */}
      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required // Prevents submission if empty
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          minLength="6" // Basic HTML frontend validation to match our backend Joi schema!
        />
        <button type="submit">Sign Up</button>
      </form>

      <p>
        Already have an account? <Link to="/login">Log in here</Link>
      </p>
    </div>
  );
};

export default Signup;
