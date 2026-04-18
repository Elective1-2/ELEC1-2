import { useState, useEffect } from "react";
import herohome from '../assets/herohome.png';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const font = "'Nunito', sans-serif";
  const fontHero = "'Bebas Neue', sans-serif";

  const s = {
    root: { fontFamily: font, margin: 0, padding: 0, minHeight: "100vh", display: "flex", flexDirection: "column" },

    // NAV
    nav: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 28px", backgroundColor: "#FFFFFF",
      width: "100%", zIndex: 20, boxSizing: "border-box",
      position: "relative", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      fontFamily: font,
    },
    logo: { display: "flex", alignItems: "center", gap: "4px", fontWeight: "900", fontSize: "20px", fontFamily: font },
    logoM: {
      color: "#FFFFFF", background: "#1A2B3C", width: "48px", height: "48px", borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: "900", fontSize: "22px", fontFamily: font,
    },
    logo2: {
      color: "#FFFFFF", background: "#3498db", width: "48px", height: "48px", borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: "900", fontSize: "22px", fontFamily: font,
    },
    logoB: {
      color: "#FFFFFF", background: "#F1C40F", width: "48px", height: "48px", borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: "900", fontSize: "22px", fontFamily: font,
    },
    navLinks: { display: "flex", alignItems: "center", gap: "20px", listStyle: "none", margin: 0, padding: 0, fontFamily: font },
    navLink: { color: "#1A2B3C", textDecoration: "none", fontSize: "13px", fontWeight: "700", fontFamily: font },
    passengerBtn: {
      backgroundColor: "#1A2B3C", color: "#FFFFFF", border: "2px solid #1A2B3C",
      padding: "6px 14px", borderRadius: "4px", fontWeight: "800", cursor: "pointer", fontSize: "12px", fontFamily: font,
    },
    loginNavBtn: {
      backgroundColor: "transparent", color: "#1A2B3C", border: "2px solid #1A2B3C",
      padding: "6px 14px", borderRadius: "4px", fontWeight: "800", cursor: "pointer", fontSize: "12px", fontFamily: font,
    },
    hamburger: {
      background: "none", border: "none", color: "#1A2B3C", fontSize: "26px", cursor: "pointer", display: "block", fontFamily: font,
    },
    mobileMenu: {
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "#FFFFFF", zIndex: 100,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "24px", fontFamily: font,
    },
    mobileCloseBtn: {
      position: "absolute", top: "20px", right: "28px",
      background: "none", border: "none", fontSize: "28px", cursor: "pointer", color: "#1A2B3C",
    },
    mobileNavLink: {
      color: "#1A2B3C", textDecoration: "none", fontSize: "18px",
      fontWeight: "700", fontFamily: font, letterSpacing: "2px",
    },
    mobileDivider: { width: "60%", border: "none", borderTop: "1px solid #ddd", margin: "4px 0" },
    mobileLoginBtn: {
      backgroundColor: "#1A2B3C", color: "#FFFFFF", border: "2px solid #1A2B3C",
      padding: "10px 40px", borderRadius: "4px", fontWeight: "800", cursor: "pointer", fontSize: "15px", fontFamily: font,
    },

    // HERO BACKGROUND
    page: {
      flex: 1,
      background: `linear-gradient(rgba(26,43,60,0.80), rgba(26,43,60,0.80)), url(${herohome}) center/cover`,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 20px",
    },

    // LOGIN CARD
    card: {
      backgroundColor: "#f0f0f0",
      borderRadius: "16px",
      padding: isMobile ? "36px 24px" : "48px 48px",
      width: "100%",
      maxWidth: "480px",
      boxSizing: "border-box",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
    },
    cardTitle: {
      fontFamily: fontHero,
      fontSize: "42px",
      color: "#1A2B3C",
      margin: "0 0 8px",
      letterSpacing: "3px",
      textAlign: "center",
    },
    inputWrap: {
      width: "100%", position: "relative",
    },
    input: {
      width: "100%", padding: "14px 16px",
      border: "1.5px solid #d0d0d0", borderRadius: "8px",
      fontSize: "15px", fontFamily: font, color: "#333",
      backgroundColor: "#fff", boxSizing: "border-box",
      outline: "none",
    },
    eyeBtn: {
      position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
      background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "18px",
    },
    forgotWrap: { width: "100%", textAlign: "center" },
    forgotLink: {
      color: "#1A2B3C", fontSize: "14px", fontWeight: "800",
      textDecoration: "none", fontFamily: font, cursor: "pointer",
    },
    submitBtn: {
      width: "100%", padding: "14px",
      backgroundColor: "#1A2B3C", color: "#FFFFFF",
      border: "none", borderRadius: "8px",
      fontSize: "16px", fontWeight: "800", fontFamily: fontHero,
      letterSpacing: "2px", cursor: "pointer", marginTop: "4px",
    },
  };

  return (
    <div style={s.root}>
      {/* NAVBAR */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <span style={s.logoM}>M</span>
          <span style={s.logo2}>2</span>
          <span style={s.logoB}>B</span>
        </div>
        {isMobile ? (
          <button style={s.hamburger} onClick={() => setMenuOpen(true)}>☰</button>
        ) : (
          <ul style={s.navLinks}>
            <li><a href="#" style={s.navLink}>ABOUT</a></li>
            <li><a href="#" style={s.navLink}>SCHEDULE</a></li>
            <li><button style={s.passengerBtn}>PASSENGER</button></li>
            <li><button style={s.loginNavBtn}>LOGIN</button></li>
          </ul>
        )}
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && isMobile && (
        <div style={s.mobileMenu}>
          <button style={s.mobileCloseBtn} onClick={() => setMenuOpen(false)}>✕</button>
          <div style={s.logo}>
            <span style={s.logoM}>M</span>
            <span style={s.logo2}>2</span>
            <span style={s.logoB}>B</span>
          </div>
          <a href="#" style={s.mobileNavLink} onClick={() => setMenuOpen(false)}>HOME</a>
          <a href="#" style={s.mobileNavLink} onClick={() => setMenuOpen(false)}>ABOUT</a>
          <a href="#" style={s.mobileNavLink} onClick={() => setMenuOpen(false)}>SCHEDULE</a>
          <hr style={s.mobileDivider} />
          <button style={s.mobileLoginBtn}>LOGIN</button>
        </div>
      )}

      {/* PAGE CONTENT */}
      <div style={s.page}>
        <div style={s.card}>
          {/* Title */}
          <h1 style={s.cardTitle}>LOGIN</h1>

          {/* Email */}
          <div style={s.inputWrap}>
            <input
              type="email"
              placeholder="Email"
              style={s.input}
            />
          </div>

          {/* Password */}
          <div style={s.inputWrap}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              style={s.input}
            />
            <button style={s.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {/* Forgot password */}
          <div style={s.forgotWrap}>
            <a href="#" style={s.forgotLink}>Forgot password?</a>
          </div>

          {/* Login button */}
          <button style={s.submitBtn}>LOGIN</button>
        </div>
      </div>
    </div>
  );
}

export default Login;