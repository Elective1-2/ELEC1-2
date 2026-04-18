import { useState, useEffect } from "react";
import herohome from '../assets/herohome.png';

function Test() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const check = () => setScreenWidth(window.innerWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Breakpoints matching the design spec
  const isMobile = screenWidth < 800;       // Mobile: 1 - 799
  const isTablet = screenWidth >= 800 && screenWidth < 1280; // Tablet: 800 - 1279
  const isDesktop = screenWidth >= 1280;    // Desktop: 1280+

  // Mobile uses carousel; tablet and desktop use grid
  const useCarousel = isMobile;

  const features = [
    { title: "Real-time Visualization", desc: "Monitor bus locations and route statuses on an interactive live map with millisecond precision." },
    { title: "Transit Delay Tracking", desc: "Detect and log delays per vehicle to identify bottlenecks in the city transit network." },
    { title: "Passenger Estimation", desc: "Intelligent passenger counting and volume estimation to prevent overcrowding in vehicles." },
    { title: "Secure Authentication", desc: "Role-based access control for Admins, Drivers, and Passengers ensuring data integrity." },
    { title: "Global API Integration", desc: "Seamlessly connects with Google Transit, Waze, and Open Data sources for comprehensive insights." },
    { title: "Congestion Prediction", desc: "Leverage historical data and machine learning to forecast traffic conditions up to 24 hours ahead." },
  ];

  const prev = () => setActiveIndex((i) => (i === 0 ? features.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === features.length - 1 ? 0 : i + 1));

  const font = "'Nunito', sans-serif";
  const fontHero = "'Bebas Neue', sans-serif";
  const fontSub = "'Barlow Condensed', sans-serif";

  const s = {
    root: { fontFamily: font, margin: 0, padding: 0 },

    // NAV
    nav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 28px",
      backgroundColor: "#FFFFFF",
      width: "100%",
      zIndex: 30,
      boxSizing: "border-box",
      position: "relative",
      boxShadow: menuOpen ? "none" : "0 2px 8px rgba(0,0,0,0.1)",
      fontFamily: font,
    },
    logo: { display: "flex", alignItems: "center", gap: "4px", fontWeight: "900", fontSize: "20px", fontFamily: font },
    logoM: {
      color: "#FFFFFF", background: "#1A2B3C",
      width: "48px", height: "48px", borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: "900", fontSize: "22px", fontFamily: font,
    },
    logo2: {
      color: "#FFFFFF", background: "#3498db",
      width: "48px", height: "48px", borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: "900", fontSize: "22px", fontFamily: font,
    },
    logoB: {
      color: "#FFFFFF", background: "#F1C40F",
      width: "48px", height: "48px", borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: "900", fontSize: "22px", fontFamily: font,
    },
    navLinks: { display: "flex", alignItems: "center", gap: "20px", listStyle: "none", margin: 0, padding: 0, fontFamily: font },
    navLink: { color: "#1A2B3C", textDecoration: "none", fontSize: "13px", fontWeight: "700", fontFamily: font },
    passengerBtn: {
      backgroundColor: "#1A2B3C", color: "#FFFFFF", border: "2px solid #1A2B3C",
      padding: "6px 14px", borderRadius: "4px", fontWeight: "800", cursor: "pointer", fontSize: "12px", fontFamily: font,
    },
    loginBtn: {
      backgroundColor: "transparent", color: "#1A2B3C", border: "2px solid #1A2B3C",
      padding: "6px 14px", borderRadius: "4px", fontWeight: "800", cursor: "pointer", fontSize: "12px", fontFamily: font,
    },
    hamburger: {
      background: "none", border: "none", color: "#1A2B3C", fontSize: "26px", cursor: "pointer", display: "block", fontFamily: font,
    },

    // MOBILE MENU DROPDOWN — drops below navbar, page still visible behind
    mobileMenuDropdown: {
      position: "absolute",
      top: "76px",        // height of the navbar
      left: 0,
      right: 0,
      backgroundColor: "#f0f0f0",
      zIndex: 50,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: "36px",
      paddingBottom: "40px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    },
    mobileMenuLogo: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      marginBottom: "36px",
    },
    mobileNavLink: {
      color: "#1A2B3C",
      textDecoration: "none",
      fontSize: "20px",
      fontWeight: "700",
      fontFamily: font,
      letterSpacing: "1px",
      padding: "14px 0",
      width: "100%",
      textAlign: "center",
      display: "block",
    },
    mobileDivider: {
      width: "200px",
      height: "1px",
      backgroundColor: "#ccc",
      margin: "8px 0",
    },
    mobileLoginBtn: {
      backgroundColor: "#1A2B3C",
      color: "#FFFFFF",
      border: "none",
      padding: "13px 60px",
      borderRadius: "8px",
      fontWeight: "800",
      cursor: "pointer",
      fontSize: "16px",
      fontFamily: font,
      letterSpacing: "1px",
      marginTop: "20px",
    },

    // HERO
    hero: {
      background: `linear-gradient(rgba(26,43,60,0.80), rgba(26,43,60,0.80)), url(${herohome}) center/cover`,
      minHeight: isMobile ? "360px" : isTablet ? "440px" : "500px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: isMobile ? "60px 24px" : "80px 40px",
      fontFamily: font,
    },
    heroTitle: {
      color: "#F1C40F",
      fontSize: isMobile ? "52px" : isTablet ? "72px" : "80px",
      fontWeight: "900",
      margin: "0 0 16px",
      letterSpacing: "3px",
      textTransform: "uppercase",
      lineHeight: 1.0,
      fontFamily: fontHero,
    },
    heroSub: {
      color: "#ddd",
      fontSize: isMobile ? "16px" : "20px",
      maxWidth: "520px",
      lineHeight: "1.7",
      margin: "0 0 28px",
      fontFamily: fontSub,
      fontWeight: "600",
    },
    monitorBtn: {
      backgroundColor: "transparent",
      color: "#fff",
      border: "2px solid #fff",
      padding: "11px 26px",
      borderRadius: "50px",
      fontWeight: "800",
      cursor: "pointer",
      fontSize: "12px",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      fontFamily: font,
    },

    // FEATURES SECTION
    featSection: {
      backgroundColor: "#ebebeb",
      padding: isMobile ? "50px 20px" : isTablet ? "55px 32px" : "60px 40px",
      textAlign: "center",
      fontFamily: font,
    },
    featH1: { fontSize: isMobile ? "22px" : "28px", fontWeight: "900", color: "#1A2B3C", margin: "0", textTransform: "uppercase", letterSpacing: "1px", fontFamily: fontHero },
    featH2: { fontSize: isMobile ? "22px" : "28px", fontWeight: "900", color: "#F1C40F", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "1px", fontFamily: fontHero },
    featDesc: { color: "#555", fontSize: "14px", maxWidth: "380px", margin: "0 auto 36px", lineHeight: "1.6", fontFamily: fontSub },

    // DESKTOP GRID — 3 cols for desktop, 3 cols for tablet too
    grid: {
      display: "grid",
      gridTemplateColumns: isTablet ? "repeat(3, 1fr)" : "repeat(3, 1fr)",
      gap: isTablet ? "14px" : "18px",
      maxWidth: isTablet ? "720px" : "900px",
      margin: "0 auto",
    },

    // CAROUSEL (mobile only)
    carouselWrap: { position: "relative", maxWidth: "500px", margin: "0 auto" },
    carouselTrack: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
    carouselSide: {
      backgroundColor: "#1A2B3C", borderRadius: "8px", padding: "20px 16px",
      width: "70px", minHeight: "140px", opacity: 0.4, flexShrink: 0,
    },
    carouselMain: {
      backgroundColor: "#1A2B3C", borderRadius: "8px", padding: "28px 24px",
      flex: 1, minHeight: "180px", boxSizing: "border-box",
    },
    arrowBtn: {
      position: "absolute", top: "50%", transform: "translateY(-50%)",
      backgroundColor: "#F1C40F", border: "none", borderRadius: "50%",
      width: "36px", height: "36px", fontSize: "18px", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: "900", color: "#1A2B3C", zIndex: 5, fontFamily: font,
    },
    dots: { display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" },
    dot: (active) => ({
      width: active ? "24px" : "8px", height: "8px",
      borderRadius: active ? "4px" : "50%",
      backgroundColor: active ? "#F1C40F" : "#aaa",
      transition: "all 0.3s", cursor: "pointer", border: "none",
    }),

    // CARD
    card: { backgroundColor: "#1A2B3C", borderRadius: "8px", padding: "26px 22px", textAlign: "left", fontFamily: font },
    cardTitle: { color: "#F1C40F", fontWeight: "800", fontSize: "15px", marginBottom: "10px", lineHeight: "1.4", fontFamily: "'Bebas Neue', sans-serif" },
    cardDesc: { color: "#bbb", fontSize: "13px", lineHeight: "1.7", margin: 0, fontFamily: font, fontWeight: "600" },

    // FOOTER
    footer: {
      backgroundColor: "#fff", borderTop: "1px solid #ddd",
      padding: isMobile ? "14px 20px" : "16px 40px",
      display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px",
      fontFamily: font,
    },
    footerLeft: { display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" },
    footerBrand: { fontSize: "13px", color: "#333", fontWeight: "800", fontFamily: font },
    footerLink: { fontSize: "13px", color: "#555", textDecoration: "none", fontWeight: "600", fontFamily: font },
    footerIcons: { display: "flex", gap: "10px" },
    icon: {
      width: "26px", height: "26px", backgroundColor: "#1A2B3C", borderRadius: "4px",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: "11px", fontWeight: "700", textDecoration: "none", fontFamily: font,
    },
  };

  const prevCard = features[(activeIndex - 1 + features.length) % features.length];
  const nextCard = features[(activeIndex + 1) % features.length];

  const LogoMark = ({ size = "48px", fontSize = "22px" }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <span style={{ ...s.logoM, width: size, height: size, fontSize }}> M</span>
      <span style={{ ...s.logo2, width: size, height: size, fontSize }}>2</span>
      <span style={{ ...s.logoB, width: size, height: size, fontSize }}>B</span>
    </div>
  );

  return (
    <div style={s.root}>

      {/* NAVBAR */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <LogoMark />
        </div>

        {/* Desktop & Tablet: show full nav links */}
        {!isMobile ? (
          <ul style={s.navLinks}>
            <li><a href="#" style={s.navLink}>ABOUT</a></li>
            <li><a href="#" style={s.navLink}>SCHEDULE</a></li>
            <li><button style={s.passengerBtn}>PASSENGER</button></li>
            <li><button style={s.loginBtn}>LOGIN</button></li>
          </ul>
        ) : (
          /* Mobile: hamburger only */
          <button style={s.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        )}

        {/* MOBILE DROPDOWN — anchored below navbar, page still visible */}
        {menuOpen && isMobile && (
          <div style={s.mobileMenuDropdown}>
            <div style={s.mobileMenuLogo}>
              <LogoMark size="54px" fontSize="24px" />
            </div>
            <a href="#" style={s.mobileNavLink} onClick={() => setMenuOpen(false)}>HOME</a>
            <a href="#" style={s.mobileNavLink} onClick={() => setMenuOpen(false)}>ABOUT</a>
            <a href="#" style={s.mobileNavLink} onClick={() => setMenuOpen(false)}>SCHEDULE</a>
            <div style={s.mobileDivider} />
            <button style={s.mobileLoginBtn} onClick={() => setMenuOpen(false)}>LOGIN</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <h1 style={s.heroTitle}>Tara, Biyahe Tayo!</h1>
        <p style={s.heroSub}>
          Revolutionizing how cities move. Monitor transit performance, predict traffic
          congestion, and optimize passenger flow using real-time data.
        </p>
        <button style={s.monitorBtn}>Monitor Your Trip</button>
      </section>

      {/* FEATURES */}
      <section style={s.featSection}>
        <h2 style={s.featH1}>By Commuters,</h2>
        <h2 style={s.featH2}>For Commuters.</h2>
        <p style={s.featDesc}>
          Everything you need to analyze modern public transportation in one single dashboard.
        </p>

        {useCarousel ? (
          /* MOBILE: Carousel */
          <div style={s.carouselWrap}>
            <div style={s.carouselTrack}>
              <div style={s.carouselSide}>
                <p style={{ ...s.cardTitle, fontSize: "11px" }}>{prevCard.title}</p>
              </div>
              <div style={s.carouselMain}>
                <p style={s.cardTitle}>{features[activeIndex].title}</p>
                <p style={s.cardDesc}>{features[activeIndex].desc}</p>
              </div>
              <div style={s.carouselSide}>
                <p style={{ ...s.cardTitle, fontSize: "11px" }}>{nextCard.title}</p>
              </div>
            </div>
            <button style={{ ...s.arrowBtn, left: "-8px" }} onClick={prev}>‹</button>
            <button style={{ ...s.arrowBtn, right: "-8px" }} onClick={next}>›</button>
            <div style={s.dots}>
              {features.map((_, i) => (
                <button key={i} style={s.dot(i === activeIndex)} onClick={() => setActiveIndex(i)} />
              ))}
            </div>
          </div>
        ) : (
          /* TABLET & DESKTOP: 3-column grid */
          <div style={s.grid}>
            {features.map((f, i) => (
              <div key={i} style={s.card}>
                <p style={s.cardTitle}>{f.title}</p>
                <p style={s.cardDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerLeft}>
          <span style={s.footerBrand}>✳ Namedly</span>
          <a href="#" style={s.footerLink}>Features</a>
          <a href="#" style={s.footerLink}>Learn more</a>
          <a href="#" style={s.footerLink}>Support</a>
        </div>
        <div style={s.footerIcons}>
          <a href="#" style={s.icon}>ig</a>
          <a href="#" style={s.icon}>in</a>
          <a href="#" style={s.icon}>X</a>
        </div>
      </footer>
    </div>
  );
}

export default Test;
