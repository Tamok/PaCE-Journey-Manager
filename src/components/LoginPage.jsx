// src/components/LoginPage.jsx
import React from 'react';
import '../styles/global.css';

const LoginPage = ({ onLogin }) => {
  return (
    <div className="login-page">
      <h2>Please log in</h2>
      <button className="btn" onClick={onLogin}>
        Login with Google
      </button>
    </div>
  );
};

export default LoginPage;
