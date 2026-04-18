import { useState } from "react";

function MobileNavbar({ isMobile, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Don't render anything if not mobile
  if (!isMobile) return null;

  return (
    <>
      <button className="mobile-hamburger" onClick={() => setMenuOpen(true)}>
        ☰
      </button>
      
      {menuOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setMenuOpen(false)}></div>
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <button className="mobile-close-btn" onClick={() => setMenuOpen(false)}>
                ✕
              </button>
            </div>
            <div className="mobile-nav-container" onClick={() => setMenuOpen(false)}>
              {children}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default MobileNavbar;