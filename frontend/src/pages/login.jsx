import { useState, useEffect } from "react";
import MobileNavbar from "../components/MobileNavbar";
import "../css/Login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="login-root">
      {/* NAVBAR */}
      <nav className="login-nav">
        <div className="login-logo">
          <span className="login-logo-m">M</span>
          <span className="login-logo-2">2</span>
          <span className="login-logo-b">B</span>
        </div>
        
        {/* Reusable Mobile Navbar - only renders on mobile */}
        <MobileNavbar isMobile={isMobile}>
          <a href="#" className="mobile-nav-link">HOME</a>
          <a href="#" className="mobile-nav-link">ABOUT</a>
          <a href="#" className="mobile-nav-link">SCHEDULE</a>
          <hr className="mobile-divider" />
          <button className="mobile-login-btn">LOGIN</button>
        </MobileNavbar>

        {/* Desktop Navigation - only shows on desktop */}
        {!isMobile && (
          <ul className="login-nav-links">
            <li><a href="#" className="login-nav-link">ABOUT</a></li>
            <li><a href="#" className="login-nav-link">SCHEDULE</a></li>
            <li><button className="login-passenger-btn">PASSENGER</button></li>
            <li><button className="login-nav-login-btn">LOGIN</button></li>
          </ul>
        )}
      </nav>

      {/* PAGE CONTENT */}
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-card-title">LOGIN</h1>

          {/* Email */}
          <div className="login-input-wrap">
            <input
              type="email"
              placeholder="Email"
              className="login-input"
            />
          </div>

          {/* Password */}
          <div className="login-input-wrap">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="login-input"
            />
            <button className="login-eye-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "x" : "👁"}
            </button>
          </div>

          {/* Forgot password */}
          <div className="login-forgot-wrap">
            <a href="#" className="login-forgot-link">Forgot password?</a>
          </div>

          {/* Login button */}
          <button className="login-submit-btn">LOGIN</button>
        </div>
      </div>
    </div>
  );
}

export default Login;