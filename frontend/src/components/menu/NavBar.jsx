import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/M2B logo.png'; 
import '../../css/NavBar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="M2B Logo" className="logo-image" />
          </Link>
        </div>

        <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        <div className={`navbar-menu ${isOpen ? 'open' : ''}`}>
          <ul className="navbar-links">
            <li>
              <Link 
                to="/about-us" 
                className="nav-item" 
                onClick={(e) => {
                  toggleMenu();
                }}
              >
                ABOUT
              </Link>
            </li>
            <li>
              <Link 
                to="/schedule" 
                className="nav-item" 
                onClick={(e)=> {
                    toggleMenu()
                }}>
                SCHEDULE
              </Link>
            </li>
          </ul>
          
          <div className="navbar-actions">
            <button 
              className="btn-passenger"
              onClick={() => navigate('/passenger')}
            >
              PASSENGER
            </button>
            <button 
              className="btn-login"
              onClick={() => navigate('/login')}
            >
              LOGIN
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;