import React from "react";
import "../css/MobileHeader.css";
import logoImage from "../assets/M2B logo.png";

function MobileHeader({ setMenuOpen }) {
  return (
    <div className="mobile-header">
      {/* Logo — LEFT */}
      <div className="mobile-header-left">
        <img src={logoImage} alt="M2B Logo" className="mobile-logo-img" />
      </div>

      {/* Hamburger — RIGHT (space-between handles placement) */}
      <button
        className="mobile-hamburger"
        onClick={() => setMenuOpen(prev => !prev)}
        aria-label="Open navigation menu"
      >
        <span className="mobile-ham-line" />
        <span className="mobile-ham-line" />
        <span className="mobile-ham-line" />
      </button>
    </div>
  );
}

export default MobileHeader;