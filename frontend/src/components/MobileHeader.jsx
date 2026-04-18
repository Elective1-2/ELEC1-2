import React from "react";
import "../css/MobileHeader.css";

function MobileHeader({ setMenuOpen }) {
  return (
    <div className="mobile-header">
      {/* Logo — LEFT */}
      <div className="mobile-header-left">
        <div className="mobile-logo">
          <div className="mobile-logo-seg seg-m">M</div>
          <div className="mobile-logo-seg seg-2">2</div>
          <div className="mobile-logo-seg seg-b">B</div>
        </div>
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
