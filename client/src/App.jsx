/**
 * client/src/App.jsx
 * * FRONTEND ENTRY POINT & ROUTER: This file manages navigation for the entire React app.
 * It uses React Router to map URLs to specific Page Components, and it uses our global
 * AuthContext to enforce "Protected Routes" (pages that require login).
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import AuthContext from "./context/AuthContext";

// 1. IMPORT PAGE COMPONENTS
// These are the actual UI screens the user will see.
import Login from "./pages/LogIn"; // (Fixed typo here!)
import Signup from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  // 2. CONSUME GLOBAL STATE
  // We use the useContext hook to tap into our AuthContext.
  // This gives us instant access to the logged-in 'user' and the 'loading' status
  // from ANYWHERE in our application, without having to pass props down manually.
  const { user, loading } = useContext(AuthContext);

  // 3. HANDLE INITIAL LOAD
  // When the app first boots up, AuthContext is busy checking localStorage for tokens.
  // We show a simple loading screen so the app doesn't accidentally redirect a valid
  // user to the login screen before it finishes checking their token.
  if (loading) return <div>Loading...</div>;

  return (
    // <Router> wraps the whole app, enabling routing features
    <Router>
      {/* <Routes> acts like a switchboard, looking for the first <Route> that matches the URL */}
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        {/* Anyone can visit these URLs without being logged in. */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* The ':token' is a dynamic URL parameter that we will extract in the ResetPassword component */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* --- PROTECTED ROUTES (The Frontend Bouncer) --- */}
        {/* This is a ternary operator (condition ? true : false). 
            If the 'user' state exists, it renders the <Dashboard /> component.
            If the 'user' is null, it immediately forces the browser to <Navigate> back to the login page. */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/* --- CATCH-ALL ROUTE --- */}
        {/* If the user types a random URL that doesn't exist (like /skdjfhskdjf), 
            this intercepts it. If they are logged in, send them to the dashboard. 
            If not, kick them to the login screen. */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
