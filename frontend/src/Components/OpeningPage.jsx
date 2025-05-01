import React from 'react';
import { Link } from 'react-router-dom';
import './OpeningPage.css';

const OpeningPage = () => {
  return (
    <div className="opening-container">
      <div className="opening-content">
        <h1>Welcome to ChatVerse</h1>
        <p>Your secure and simple way to connect.</p>
        <div className="opening-buttons">
          <Link to="/login" className="btn">Login</Link>
          <Link to="/signup" className="btn btn-outline">Signup</Link>
        </div>
      </div>
    </div>
  );
};

export default OpeningPage;



