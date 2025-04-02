// src/components/ContactAdminPage.jsx
import React, { useState } from 'react';
import '../styles/global.css';

const ContactAdminPage = () => {
  const [message, setMessage] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement submission logic (e.g. send email or record request)
    alert("Your request has been submitted. An administrator will contact you soon.");
    setMessage('');
  };

  return (
    <div className="contact-admin-page">
      <h2>Access Restricted</h2>
      <p>Your account is not whitelisted. Please contact the page administrator to request access.</p>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Enter your request message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="4"
          cols="50"
          required
        />
        <br />
        <button type="submit" className="btn">Submit Request</button>
      </form>
    </div>
  );
};

export default ContactAdminPage;
