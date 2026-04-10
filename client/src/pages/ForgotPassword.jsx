import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email },
      );
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container">
      <h2>Reset Password</h2>
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
      {error && <div className="error-msg">{error}</div>}

      <p style={{ marginBottom: "20px", textAlign: "left" }}>
        Enter your email address and we will send you a link to reset your
        password.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>

      <p>
        Remember your password? <Link to="/login">Log in here</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
