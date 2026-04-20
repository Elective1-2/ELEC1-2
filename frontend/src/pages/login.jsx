import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../css/Login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-root">
      {/* Integrated Shared Navbar */}
      <Navbar />

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

      {/* Integrated Shared Footer */}
      <Footer />
    </div>
  );
}

export default Login;