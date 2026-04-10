/**
 * client/src/context/AuthContext.jsx
 * * GLOBAL STATE MANAGER: This file uses React Context to manage the user's
 * authentication status across the entire application. It acts as the single
 * source of truth for whether someone is logged in or not.
 */

import { createContext, useState, useEffect } from "react";
// jwt-decode safely unwraps the Base64 encoded payload of a JWT.
// It DOES NOT verify the secret signature (only the backend can do that).
// It simply lets React read the public data inside (like the userId).
import { jwtDecode } from "jwt-decode";

// 1. CREATE THE CONTEXT
// This creates the actual "loudspeaker" that other components will listen to.
const AuthContext = createContext();

// 2. CREATE THE PROVIDER COMPONENT
// This is a wrapper component that goes around our entire <App />.
// Everything inside the {children} tag will have access to the auth data.
export const AuthProvider = ({ children }) => {
  // --- STATE DEFINITIONS ---
  const [user, setUser] = useState(null); // Holds the decoded user data (e.g., userId)
  const [token, setToken] = useState(null); // Holds the raw, un-decoded string

  // We use 'loading' as a safety buffer. Checking localStorage takes a split second.
  // If we didn't have this, React might instantly redirect a valid user to the login
  // page before it finished fetching their saved token!
  const [loading, setLoading] = useState(true);

  // --- INITIALIZATION (The "Remember Me" phase) ---
  // useEffect with an empty array [] means this runs EXACTLY ONCE when the app first loads.
  useEffect(() => {
    // 1. Look in the browser's persistent storage for an access token
    const storedToken = localStorage.getItem("accessToken");

    if (storedToken) {
      try {
        // 2. Unwrap the token to see who it belongs to
        const decodedUser = jwtDecode(storedToken);

        // 3. Update React's active memory (state)
        setUser(decodedUser);
        setToken(storedToken);
      } catch (error) {
        // If the token is corrupted or manually tampered with in the browser console,
        // jwtDecode will fail. We catch the error and securely wipe the bad token.
        console.error("Invalid token found", error);
        localStorage.removeItem("accessToken");
      }
    }

    // Whether we found a token or not, we are done checking.
    // Tell App.jsx it is safe to render the page!
    setLoading(false);
  }, []);

  // --- ACTIONS ---

  // Called by the Login Page when the backend successfully returns a token
  const login = (newToken) => {
    localStorage.setItem("accessToken", newToken); // Save to browser storage
    setToken(newToken); // Save to React state
    setUser(jwtDecode(newToken)); // Decode and save user info
  };

  // Called by the Dashboard or the Axios Interceptor when a session ends
  const logout = () => {
    localStorage.removeItem("accessToken"); // Erase from browser storage
    setToken(null); // Erase from React state
    setUser(null);
  };

  // 3. EXPORT THE DATA
  // The 'value' object contains everything we want to broadcast to the rest of the app.
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
