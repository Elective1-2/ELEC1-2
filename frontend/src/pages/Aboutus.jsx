import React from 'react';
import '../css/Aboutus.css';

// --- Shared Components ---
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

// --- Imports: Photos ---
import glenPic from '../assets/glen.jpg'; 
import christianPic from '../assets/christian.jpg'; 
import davePic from '../assets/dave.jpg';
import princessPic from '../assets/princess.jpg';
import sophiaPic from '../assets/sophia.jpg';

function Aboutus() {
  const creators = [
    { name: "Glen Justine Batis", role: "Developer", image: glenPic },
    { name: "Christian Joeffrey Castro", role: "Developer", image: christianPic },
    { name: "Dave Anthony De Jesus", role: "Developer", image: davePic },
    { name: "Princess Ann Nicolas", role: "Developer", image: princessPic },
    { name: "Sophia Marielle Tubuan", role: "Developer", image: sophiaPic }
  ];

  return (
    <div className="about-root">
      <Navbar />

      {/* Hero Section - Subtext Removed */}
      <div className="about-hero desktop">
        <h1 className="about-hero-title">ABOUT US</h1>
      </div>

      {/* Intro Section */}
      <div className="about-feat-section desktop">
        <h1 className="about-feat-h1">BY COMMUTERS,</h1>
        <h2 className="about-feat-h2">FOR COMMUTERS.</h2>
        <p className="about-feat-desc">
          M2B or Metropolitan to Boundaries is a Smart Public Transportation Analytics Platform designed to transform how 
          commuters and planners navigate transit systems between Metro Manila and adjacent provinces.
        </p>
      </div>

      {/* Mission & Vision Section */}
      <div className="about-grid-container">
        <div className="about-grid">
          <div className="about-card">
            <h3 className="about-card-title">MISSION</h3>
            <p className="about-card-desc">
              To enhance public transportation efficiency by leveraging data analytics, 
              enabling commuters to travel smarter and helping authorities make informed decisions.
            </p>
          </div>
          <div className="about-card">
            <h3 className="about-card-title">VISION</h3>
            <p className="about-card-desc">
              A future where commuting is seamless, predictable, and optimized through 
              intelligent systems—reducing congestion and improving quality of life.
            </p>
          </div>
        </div>
      </div>

      {/* What We Do Section */}
      <div className="about-wwd-wrapper">
        <h2 className="about-feat-h1">WHAT WE DO</h2>
        <div className="about-wwd-flex">
          <p className="about-wwd-text">
            M2B provides a centralized dashboard that transforms complex transportation data 
            into easy-to-understand insights.
          </p>
          <div className="about-wwd-divider"></div>
          <ul className="about-wwd-list">
            <li>Daily commuters seeking efficient routes</li>
            <li>Transport operators optimizing services</li>
            <li>Authorities improving public transportation</li>
          </ul>
        </div>
      </div>

      {/* Creators Section */}
      <div className="about-creators-wrapper">
        <h2 className="about-feat-h1">THE CREATORS</h2>
        <div className="about-creators-list">
          {creators.map((creator, index) => (
            <div className="about-creator-row" key={index}>
              <div className="about-creator-avatar">
                <img src={creator.image} alt={creator.name} />
              </div>
              <div className="about-creator-info">
                <h4 className="about-creator-name">{creator.name}</h4>
                <p className="about-creator-desc">{creator.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Aboutus;