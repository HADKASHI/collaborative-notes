// ErrorPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./ErrorPage.css";

const ErrorPage = ({ message }) => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate("/"); // Navigate back to the home page
  };

  return (
    <div className="error-page">
      <h1>Oops! Something went wrong.</h1>
      <p>
        {message || "An unexpected error occurred. Please try again later."}
      </p>
      <button onClick={handleBackToHome}>Back to Home</button>
    </div>
  );
};

export default ErrorPage;
