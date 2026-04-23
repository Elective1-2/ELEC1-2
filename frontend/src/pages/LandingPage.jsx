import { useState, useEffect } from "react";
import herohome from '../assets/herohome.png';
import { Link, useNavigate } from 'react-router-dom';

import Navbar from "../components/menu/NavBar"; 
import Footer from "../components/menu/Footer";
import "../css/Landingpage.css";

function LandingPage() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => setScreenWidth(window.innerWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  const features = [
    { title: "Real-time Visualization", desc: "Monitor bus locations and route statuses on an interactive live map with millisecond precision." },
    { title: "Transit Delay Tracking", desc: "Detect and log delays per vehicle to identify bottlenecks in the city transit network." },
    { title: "Passenger Estimation", desc: "Intelligent passenger counting and volume estimation to prevent overcrowding in vehicles." },
    { title: "Secure Authentication", desc: "Role-based access control for Admins, Drivers, and Passengers ensuring data integrity." },
    { title: "Global API Integration", desc: "Seamlessly connects with Google Transit, Waze, and Open Data sources for comprehensive insights." },
    { title: "Congestion Prediction", desc: "Leverage historical data and machine learning to forecast traffic conditions up to 24 hours ahead." },
  ];

  return (
    <div className="landing-root">
      <Navbar />

      {/* HERO */}
      <section className={`landing-hero ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
        <h1 className="landing-hero-title">Tara, Biyahe Tayo!</h1>
        <p className="landing-hero-sub">
          Revolutionizing how cities move. Monitor transit performance, predict traffic
          congestion, and optimize passenger flow using real-time data.
        </p>
        <button className="landing-monitor-btn" onClick={() => navigate('/passenger')}>
          Monitor Your Trip
        </button>
      </section>

      {/* FEATURES */}
      <section className={`landing-feat-section ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
        <h2 className="landing-feat-h1">By Commuters,</h2>
        <h2 className="landing-feat-h2">For Commuters.</h2>
        <p className="landing-feat-desc">
          Everything you need to analyze modern public transportation in one single dashboard.
        </p>

        {/* DESKTOP GRID */}
        {isDesktop && (
          <div className="landing-grid">
            {features.map((f, i) => (
              <div key={i} className="landing-card">
                <p className="landing-card-title">{f.title}</p>
                <p className="landing-card-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* MOBILE + TABLET CAROUSEL */}
        {!isDesktop && (
          <div className="lc-wrapper">
            <ul className="lc-carousel">
              {features.map((f, i) => (
                <div
                  key={i}
                  className={i === 2 ? 'scroll-start' : ''}
                >
                  <div className="lc-card-inner">
                    <p className="lc-card-title">{f.title}</p>
                    <p className="lc-card-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </ul>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;