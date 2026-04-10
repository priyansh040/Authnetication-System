/**
 * client/src/pages/Dashboard.jsx
 * * SECURE DASHBOARD COMPONENT: This is the "VIP Room".
 * It automatically fetches the user's private profile data from the backend
 * using our custom Axios interceptor, which handles the token math behind the scenes.
 */

import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
// CRITICAL: Notice we import our custom 'api' instance here, NOT standard 'axios'.
// This ensures our access token is automatically attached to the request!
import api from "../api/axios";

const Dashboard = () => {
  // --- STATE & CONTEXT ---
  // Grab the logout function from our global loudspeaker
  const { logout } = useContext(AuthContext);

  // Local state to hold the secure profile data once it arrives from the backend
  const [profileData, setProfileData] = useState(null);

  // --- LIFECYCLE: FETCH DATA ON LOAD ---
  // useEffect with an empty dependency array [] runs exactly once when this page loads.
  useEffect(() => {
    // We declare an async function inside useEffect (Best Practice for fetching data)
    const fetchProfile = async () => {
      try {
        // Step A: Request the secure data.
        // * THE MAGIC: Because we use 'api.get()', the Axios Interceptor we built
        // intercepts this request, grabs the token from localStorage, and attaches it.
        // If the token is expired, the interceptor silently fetches a new one and retries!
        const response = await api.get("/users/profile");

        // Step B: Save the data to React's memory
        setProfileData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };

    // Execute the function
    fetchProfile();
  }, []);

  // --- EVENT HANDLERS ---
  const handleLogout = () => {
    // 1. Clean up the 7-day token from browser storage
    localStorage.removeItem("refreshToken");

    // 2. Call the global logout function to clean up the 15-minute token
    // and wipe the React state. This instantly triggers the Protected Route logic
    // in App.jsx and kicks the user back to the login screen!
    logout();
  };

  // --- RENDER UI ---
  return (
    <div className="container">
      <h1>VIP Dashboard</h1>

      {/* CONDITIONAL RENDERING: 
          If profileData exists, show the card. 
          If it is null (still fetching), show the loading text. */}
      {profileData ? (
        <div className="profile-card">
          <p>
            <strong>Name:</strong> {profileData.name}
          </p>
          <p>
            <strong>Email:</strong> {profileData.email}
          </p>
          <p>
            <strong>Member Since:</strong>{" "}
            {/* Format the ugly MongoDB timestamp into a clean, human-readable date */}
            {new Date(profileData.createdAt).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <p>Loading your secure data...</p>
      )}

      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default Dashboard;
