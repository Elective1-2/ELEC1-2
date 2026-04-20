import { useState, useEffect } from "react";
import herohome from '../assets/herohome.png';
import Navbar from "../components/NavBar"; 
import Footer from "../components/Footer"; // Imported the new Footer component
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

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1280;
  const isDesktop = screenWidth >= 1280;

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

      {/* FOOTER CALL */}
      <Footer />
    </div>
  );
}

export default LandingPage;