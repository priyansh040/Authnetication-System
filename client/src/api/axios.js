/**
 * client/src/api/axios.js
 * * THE SILENT ASSISTANT (AXIOS INTERCEPTORS):
 * This file creates a custom Axios instance. It intercepts outgoing requests to
 * automatically attach the Access Token, and intercepts incoming responses to
 * silently handle 401 (Unauthorized) errors by refreshing the token behind the scenes.
 */

import axios from "axios";

// 1. CREATE CUSTOM INSTANCE
// Instead of importing 'axios' directly in our components, we will import this 'api' object.
// This ensures all requests automatically point to our backend port.
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 2. REQUEST INTERCEPTOR (The Outbound Checkpoint)
// This runs BEFORE every single request leaves the React app.
api.interceptors.request.use(
  (config) => {
    // Grab the 15-minute wristband from browser storage
    const token = localStorage.getItem("accessToken");

    // If they have one, attach it to the HTTP Headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Send the request on its way!
  },
  (error) => Promise.reject(error),
);

// 3. RESPONSE INTERCEPTOR (The Inbound Checkpoint)
// This runs EVERY TIME the backend sends a response back to React.
api.interceptors.response.use(
  (response) => response, // If the request succeeds (200 OK), just let it pass through.

  // If the backend throws an error (like a 401 Unauthorized), this async function catches it.
  async (error) => {
    // 'originalRequest' holds the exact API call the user was trying to make (e.g., fetch profile)
    const originalRequest = error.config;

    // Step A: Did the backend kick us out because the 15-minute token expired?
    // And, have we already tried to fix this? (The _retry flag prevents infinite loops)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark that we are attempting a rescue operation

      try {
        // Step B: Grab the 7-day VIP Pass (Refresh Token)
        const refreshToken = localStorage.getItem("refreshToken");

        // Ask the backend to exchange the VIP pass for a brand new 15-minute wristband.
        // NOTE: We use standard 'axios' here, NOT our custom 'api', to avoid an infinite loop!
        const res = await axios.post("http://localhost:5000/api/auth/refresh", {
          refreshToken,
        });

        // Step C: Success! Save the shiny new access token.
        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        // Step D: The Rescue!
        // Update the original, failed request with the NEW token...
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // ...and fire it off again! The React component will never even know it failed the first time.
        return api(originalRequest);
      } catch (refreshError) {
        // Step E: Catastrophic Failure.
        // If the Refresh Token is ALSO expired (it has been 7 days), the user's session is truly over.
        console.error("Session expired. Please log in again.");

        // Wipe the slate clean
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Force the browser to kick them back to the login screen
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    // If it was a normal error (like 404 Not Found, or 400 Bad Request), just pass it along
    return Promise.reject(error);
  },
);

export default api;
