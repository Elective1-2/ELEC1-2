import React from 'react';
import '../css/Aboutus.css';

// --- Shared Components ---
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// --- Imports: Backgrounds and Photos ---
import heroImage from '../assets/herohome.png'; 
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
    <div className="about-page">
      <Navbar />

      {/* Banner Section */}
      <div 
        className="banner-section"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <h1 className="banner-title">ABOUT US</h1>
      </div>

      {/* Intro Section */}
      <div className="intro-section container">
        <h2 className="intro-heading">
          <span className="text-dark">BY COMMUTERS, </span>
          <span className="text-yellow">FOR COMMUTERS.</span>
        </h2>
        <div className="intro-text">
          <p>
            M2B (Metropolitan to Boundary) is a Smart Public Transportation Analytics Platform designed to transform how commuters, planners, and stakeholders understand and navigate transit systems between Metro Manila and Bulacan.
          </p>
          <p>
            With the growing demand for efficient, reliable, and data-driven transportation, M2B bridges the gap between raw transit data and real-world decision-making—delivering insights that empower smarter mobility.
          </p>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="mission-vision-section container">
        <div className="mv-card">
          <h3>MISSION</h3>
          <p>
            To enhance public transportation efficiency by leveraging data analytics, enabling commuters to travel smarter and helping authorities make informed, impactful decisions.
          </p>
        </div>
        <div className="mv-card">
          <h3>VISION</h3>
          <p>
            We envision a future where commuting between Manila and Bulacan is seamless, predictable, and optimized through intelligent systems—reducing congestion, saving time, and improving quality of life.
          </p>
        </div>
      </div>

      {/* What We Do Section */}
      <div className="what-we-do-wrapper">
        <div className="container">
          <h2 className="what-we-do-main-title">WHAT WE DO</h2>
          <div className="what-we-do-content">
            <div className="wwd-left">
              <p>
                M2B provides a centralized dashboard that transforms complex transportation data into easy-to-understand insights. Inspired by modern P2P bus systems, our platform monitors and analyzes transit performance in real time.
              </p>
            </div>
            <div className="wwd-divider"></div>
            <div className="wwd-right">
              <p className="support-heading">We aim to support:</p>
              <ul>
                <li>Daily commuters seeking efficient routes</li>
                <li>Transport operators optimizing services</li>
                <li>Authorities improving our public transportation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* The Creators Section */}
      <div className="creators-section container">
        <h2 className="creators-title">THE CREATORS</h2>
        <div className="creators-list">
          {creators.map((creator, index) => (
            <div className="creator-row-card" key={index}>
              <div className="creator-avatar">
                <img src={creator.image} alt={creator.name} />
              </div>
              <div className="creator-info">
                <h4>{creator.name}</h4>
                <p>{creator.role}</p>
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