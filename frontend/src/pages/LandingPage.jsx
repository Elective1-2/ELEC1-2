import { useState, useEffect } from "react";
import herohome from '../assets/herohome.png';
import MobileNavbar from "../components/MobileNavbar";
import "../css/Landingpage.css";


function LandingPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const check = () => setScreenWidth(window.innerWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Breakpoints matching the design spec
  const isMobile = screenWidth < 768;       // Mobile: 1 - 799
  const isTablet = screenWidth >= 768 && screenWidth < 1280; // Tablet: 800 - 1279
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

  const prevCard = features[(activeIndex - 1 + features.length) % features.length];
  const nextCard = features[(activeIndex + 1) % features.length];

  const LogoMark = ({ size = "48px", fontSize = "22px" }) => (
    <div className="logo-mark">
      <span className="logo-m" style={{ width: size, height: size, fontSize }}>M</span>
      <span className="logo-2" style={{ width: size, height: size, fontSize }}>2</span>
      <span className="logo-b" style={{ width: size, height: size, fontSize }}>B</span>
    </div>
  );

  return (
    <div className="landing-root">
      {/* NAVBAR */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <LogoMark />
        </div>

        {/* Reusable Mobile Navbar - only renders on mobile */}
        <MobileNavbar isMobile={isMobile}>
          <a href="#" className="mobile-nav-link">HOME</a>
          <a href="#" className="mobile-nav-link">ABOUT</a>
          <a href="#" className="mobile-nav-link">SCHEDULE</a>
          <hr className="mobile-divider" />
          <button className="mobile-login-btn">LOGIN</button>
        </MobileNavbar>

        {/* Desktop & Tablet: show full nav links */}
        {!isMobile && (
          <ul className="landing-nav-links">
            <li><a href="#" className="landing-nav-link">ABOUT</a></li>
            <li><a href="#" className="landing-nav-link">SCHEDULE</a></li>
            <li><button className="landing-passenger-btn">PASSENGER</button></li>
            <li><button className="landing-login-btn">LOGIN</button></li>
          </ul>
        )}
      </nav>

      {/* HERO */}
      <section className={`landing-hero ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
        <h1 className="landing-hero-title">Tara, Biyahe Tayo!</h1>
        <p className="landing-hero-sub">
          Revolutionizing how cities move. Monitor transit performance, predict traffic
          congestion, and optimize passenger flow using real-time data.
        </p>
        <button className="landing-monitor-btn">Monitor Your Trip</button>
      </section>

      {/* FEATURES */}
      <section className={`landing-feat-section ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
        <h2 className="landing-feat-h1">By Commuters,</h2>
        <h2 className="landing-feat-h2">For Commuters.</h2>
        <p className="landing-feat-desc">
          Everything you need to analyze modern public transportation in one single dashboard.
        </p>

        {useCarousel ? (
          /* MOBILE: Carousel */
          <div className="landing-carousel-wrap">
            <div className="landing-carousel-track">
              <div className="landing-carousel-side">
                <p className="landing-carousel-side-title">{prevCard.title}</p>
              </div>
              <div className="landing-carousel-main">
                <p className="landing-card-title">{features[activeIndex].title}</p>
                <p className="landing-card-desc">{features[activeIndex].desc}</p>
              </div>
              <div className="landing-carousel-side">
                <p className="landing-carousel-side-title">{nextCard.title}</p>
              </div>
            </div>
            <button className="landing-arrow-btn landing-arrow-left" onClick={prev}>‹</button>
            <button className="landing-arrow-btn landing-arrow-right" onClick={next}>›</button>
            <div className="landing-dots">
              {features.map((_, i) => (
                <button 
                  key={i} 
                  className={`landing-dot ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(i)} 
                />
              ))}
            </div>
          </div>
        ) : (
          /* TABLET & DESKTOP: 3-column grid */
          <div className="landing-grid">
            {features.map((f, i) => (
              <div key={i} className="landing-card">
                <p className="landing-card-title">{f.title}</p>
                <p className="landing-card-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className={`landing-footer ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
        <div className="landing-footer-left">
          <span className="landing-footer-brand">✳ Namedly</span>
          <a href="#" className="landing-footer-link">Features</a>
          <a href="#" className="landing-footer-link">Learn more</a>
          <a href="#" className="landing-footer-link">Support</a>
        </div>
        <div className="landing-footer-icons">
          <a href="#" className="landing-icon">ig</a>
          <a href="#" className="landing-icon">in</a>
          <a href="#" className="landing-icon">X</a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;