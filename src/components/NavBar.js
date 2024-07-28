// src/components/NavBar.js
import React from "react";
import { auth } from "../firebase";
import "./NavBar.css"; // Import your CSS file for styling

const NavBar = ({ user, onAddNote }) => {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <nav className="nav-bar">
      <div className="nav-content">
        <button
          className="nav-button"
          onClick={() => (window.location.href = "/")}
        >
          Home
        </button>
        {user && (
          <>
            <button className="nav-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
