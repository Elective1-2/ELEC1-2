import React from 'react';
import '../css/Footer.css';
import logo from '../assets/M2B logo.png';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Logo and Name Section */}
        <div className="footer-branding">
          <img src={logo} alt="M2B Logo" className="footer-logo-img" />
        </div>

        {/* Development Credits Section */}
        <div className="footer-credits">
          <p className="credit-text">Developed by <strong>BSCpE Students</strong></p>
          <p className="credit-text">Bulacan State University</p>
        </div>

        <div className="footer-divider"></div>

        {/* Copyright Section */}
        <div className="footer-copyright">
          <p>&copy; 2026 M2B. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;