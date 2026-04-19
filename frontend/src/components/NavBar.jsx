import React, { useState } from 'react';
import '../css/NavBar.css';
import logo from '../assets/M2B logo.png'; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <a href="/">
            <img src={logo} alt="M2B Logo" className="logo-image" />
          </a>
        </div>

        <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        <div className={`navbar-menu ${isOpen ? 'open' : ''}`}>
          <ul className="navbar-links">
            <li><a href="/about" className="nav-item" onClick={toggleMenu}>ABOUT</a></li>
            <li><a href="/schedule" className="nav-item" onClick={toggleMenu}>SCHEDULE</a></li>
          </ul>
          
          <div className="navbar-actions">
            <button className="btn-passenger">PASSENGER</button>
            <button className="btn-login">LOGIN</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;