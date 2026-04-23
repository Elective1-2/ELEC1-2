import React from 'react';
import '../../css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-info">
          <span className="credit-text">Developed by <strong>BSCpE Students</strong></span>
          <span className="separator">|</span>
          <span className="credit-text">Bulacan State University</span>
        </div>

        <div className="footer-copyright">
          <p>&copy; 2026 M2B. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;