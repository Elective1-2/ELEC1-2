import { useState, useEffect } from "react";

function Tracking() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("Live Tracking");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 900);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const font = "'Nunito', sans-serif";

  // Bus data based on the image
  const allBuses = [
    { id: 101, route: "Malolos - Trinoma Route", status: "On Track", eta: "10:45 AM", delay: false },
    { id: 102, route: "Malolos - Trinoma Route", status: "On Track", eta: "11:00 AM", delay: false },
    { id: 103, route: "Malolos - Trinoma Route", status: "On Track", eta: "10:45 AM", delay: false },
    { id: 104, route: "Malolos - Trinoma Route", status: "On Track", eta: "10:45 AM", delay: false },
    { id: 105, route: "Malolos - Trinoma Route", status: "On Track", eta: "10:45 AM", delay: false },
    { id: 106, route: "Malolos - Trinoma Route", status: "On Track", eta: "10:45 AM", delay: false },
    { id: 88, route: "Malolos - Trinoma Route", status: "On Track", eta: "10:45 AM", delay: false },
    { id: 67, route: "Malolos - Trinoma Route", status: "On Track", eta: "10:45 AM", delay: false },
  ];

  const filteredBuses = allBuses.filter(bus => 
    searchTerm === "" || bus.id.toString().includes(searchTerm)
  );

  const s = {
    root: { display: "flex", minHeight: "100vh", fontFamily: font, backgroundColor: "#f5f6f8" },

    // Header with hamburger button (ALWAYS VISIBLE)
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 20px",
      background: "#2f4863",
      color: "white",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },

    hamburgerBtn: {
      background: "none",
      border: "none",
      color: "white",
      fontSize: "28px",
      cursor: "pointer",
      padding: "8px 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "6px",
      transition: "background 0.2s"
    },

    logo: {
      fontWeight: "bold",
      fontSize: "20px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },

    logoIcon: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      background: "#f1c40f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold"
    },

    adminInfo: {
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },

    adminBadge: {
      background: "rgba(255,255,255,0.2)",
      padding: "6px 14px",
      borderRadius: "20px",
      fontSize: "13px",
      fontWeight: "500"
    },

    main: { 
      flex: 1, 
      padding: "20px", 
      background: "#f5f6f8",
      minHeight: "100vh",
      marginTop: "60px",
      transition: "margin-left 0.3s ease"
    },

    topbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "25px",
      flexWrap: "wrap",
      gap: "10px"
    },

    search: {
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      width: isMobile ? "100%" : "250px",
      fontSize: "14px",
      outline: "none"
    },

    card: {
      background: "white",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "25px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
    },

    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      flexWrap: "wrap",
      gap: "10px"
    },

    badgeCount: {
      background: "#f1c40f",
      padding: "4px 12px",
      borderRadius: "20px",
      fontWeight: "bold",
      fontSize: "14px"
    },

    busItem: {
      background: "#f8f9fa",
      padding: "15px",
      borderRadius: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
      flexWrap: "wrap",
      gap: "10px",
      border: "1px solid #eef2f6"
    },

    busInfo: {
      flex: 1
    },

    busNumber: {
      fontWeight: "bold",
      fontSize: "16px"
    },

    routeText: {
      fontSize: "12px",
      color: "#666",
      marginTop: "4px"
    },

    statusRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginTop: "6px",
      flexWrap: "wrap"
    },

    statusGreen: {
      background: "#2ecc71",
      color: "white",
      padding: "2px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "bold"
    },

    statusRed: {
      background: "#e74c3c",
      color: "white",
      padding: "2px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "bold"
    },

    etaText: {
      fontSize: "12px",
      color: "#555"
    },

    viewBtn: {
      background: "#2c3e50",
      color: "white",
      border: "none",
      padding: "8px 20px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "bold",
      transition: "background 0.2s"
    },

    transitBox: {
      height: "280px",
      background: "#eef0f2",
      borderRadius: "12px",
      position: "relative",
      overflow: "hidden",
      marginTop: "10px"
    },

    legend: {
      display: "flex",
      gap: "20px",
      marginTop: "15px",
      paddingTop: "10px",
      borderTop: "1px solid #eef2f6",
      flexWrap: "wrap"
    },

    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px"
    },

    footer: {
      marginTop: "30px",
      padding: "20px",
      textAlign: "center",
      fontSize: "12px",
      color: "#888",
      borderTop: "1px solid #eef2f6"
    },

    // Sidebar (blue navigation panel)
    sidebar: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "260px",
      height: "100vh",
      background: "#2f4863",
      color: "white",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      zIndex: 1000,
      transition: "transform 0.3s ease",
      boxShadow: "2px 0 10px rgba(0,0,0,0.2)"
    },

    sidebarHidden: {
      transform: "translateX(-100%)"
    },

    sidebarVisible: {
      transform: "translateX(0)"
    },

    sidebarLogo: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
      marginBottom: "10px",
      paddingBottom: "15px",
      borderBottom: "1px solid rgba(255,255,255,0.2)"
    },

    circle: {
      width: "38px",
      height: "38px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "18px"
    },

    navBtn: {
      color: "white",
      background: "none",
      border: "none",
      textAlign: "left",
      cursor: "pointer",
      padding: "12px 12px",
      borderRadius: "8px",
      fontSize: "15px",
      transition: "background 0.2s"
    },

    activeNavBtn: {
      background: "#4ea3ff",
      color: "white",
      border: "none",
      textAlign: "left",
      cursor: "pointer",
      padding: "12px 12px",
      borderRadius: "8px",
      fontSize: "15px"
    },

    closeBtn: {
      position: "absolute",
      top: "15px",
      right: "15px",
      background: "none",
      border: "none",
      color: "white",
      fontSize: "24px",
      cursor: "pointer",
      padding: "5px",
      display: isMobile ? "block" : "none"
    },

    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 999,
      transition: "opacity 0.3s ease"
    }
  };

  return (
    <div style={s.root}>
      {/* Overlay when sidebar is open */}
      {sidebarOpen && <div style={s.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar (Blue Navigation Panel) */}
      <div style={{ ...s.sidebar, ...(sidebarOpen ? s.sidebarVisible : s.sidebarHidden) }}>
        <button style={s.closeBtn} onClick={() => setSidebarOpen(false)}>✕</button>
        
        <div style={s.sidebarLogo}>
          <div style={{ ...s.circle, background: "#1A2B3C" }}>M</div>
          <div style={{ ...s.circle, background: "#3498db" }}>2</div>
          <div style={{ ...s.circle, background: "#f1c40f" }}>B</div>
        </div>

        <button 
          style={activeTab === "Dashboard" ? s.activeNavBtn : s.navBtn}
          onClick={() => { setActiveTab("Dashboard"); setSidebarOpen(false); }}
        >
          📊 Dashboard
        </button>
        <button 
          style={activeTab === "Live Tracking" ? s.activeNavBtn : s.navBtn}
          onClick={() => { setActiveTab("Live Tracking"); setSidebarOpen(false); }}
        >
          📍 Live Tracking
        </button>
        <button 
          style={activeTab === "Analytics" ? s.activeNavBtn : s.navBtn}
          onClick={() => { setActiveTab("Analytics"); setSidebarOpen(false); }}
        >
          📈 Analytics
        </button>
        <button 
          style={activeTab === "Management" ? s.activeNavBtn : s.navBtn}
          onClick={() => { setActiveTab("Management"); setSidebarOpen(false); }}
        >
          ⚙️ Management
        </button>
      </div>

      {/* Header with Hamburger Button (ALWAYS VISIBLE) */}
      <div style={s.header}>
        <button 
          style={s.hamburgerBtn} 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
        >
          ☰
        </button>
        
        <div style={s.logo}>
          <div style={s.logoIcon}>M2B</div>
          <span style={{ display: isMobile ? "none" : "inline" }}>Monitor to Bus</span>
        </div>
        
        <div style={s.adminInfo}>
          <div style={s.adminBadge}>Admin123</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={s.main}>
        {/* TOPBAR */}
        <div style={s.topbar}>
          <input 
            style={s.search} 
            placeholder="Search bus number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ACTIVE BUSES SECTION */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={{ margin: 0 }}>Active Buses</h3>
            <span style={s.badgeCount}>{filteredBuses.length}</span>
          </div>

          {filteredBuses.map((bus) => (
            <div key={bus.id} style={s.busItem}>
              <div style={s.busInfo}>
                <div style={s.busNumber}>Bus #{bus.id}</div>
                <div style={s.routeText}>{bus.route}</div>
                <div style={s.statusRow}>
                  <span style={bus.delay ? s.statusRed : s.statusGreen}>
                    {bus.delay ? "Delayed" : "On Track"}
                  </span>
                  <span style={s.etaText}>ETA: {bus.eta}</span>
                </div>
              </div>
              <button style={s.viewBtn}>VIEW</button>
            </div>
          ))}
        </div>

        {/* LIVE TRANSIT SECTION */}
        <div style={s.card}>
          <h3 style={{ margin: "0 0 15px 0" }}>Live Transit</h3>
          <div style={s.transitBox}>
            {/* Road background */}
            <div style={{ 
              position: "absolute", 
              top: "40%", 
              left: "5%", 
              right: "5%", 
              height: "8px", 
              background: "#555",
              borderRadius: "4px"
            }}></div>
            
            {/* Moving bus indicator */}
            <div style={{ 
              position: "absolute", 
              top: "36%", 
              left: "20%", 
              background: "#3498db",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              boxShadow: "0 0 0 3px rgba(52,152,219,0.3)"
            }}></div>
            <div style={{ 
              position: "absolute", 
              top: "28%", 
              left: "18%", 
              fontSize: "10px", 
              background: "white",
              padding: "2px 6px",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>Bus #101</div>

            {/* Another bus */}
            <div style={{ 
              position: "absolute", 
              top: "36%", 
              left: "55%", 
              background: "#3498db",
              width: "12px",
              height: "12px",
              borderRadius: "50%"
            }}></div>
            <div style={{ 
              position: "absolute", 
              top: "28%", 
              left: "52%", 
              fontSize: "10px", 
              background: "white",
              padding: "2px 6px",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>Bus #104</div>

            {/* Heavy congestion indicator */}
            <div style={{ 
              position: "absolute", 
              top: "36%", 
              left: "75%", 
              background: "#e74c3c",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              animation: "pulse 1.5s infinite"
            }}></div>
            <div style={{ 
              position: "absolute", 
              top: "24%", 
              left: "70%", 
              fontSize: "10px", 
              background: "#e74c3c",
              color: "white",
              padding: "3px 8px",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              fontWeight: "bold"
            }}>⚠️ Heavy Congestion</div>

            {/* Traffic line */}
            <div style={{ 
              position: "absolute", 
              top: "36%", 
              left: "70%", 
              width: "20%", 
              height: "8px", 
              background: "#e74c3c",
              borderRadius: "4px"
            }}></div>
          </div>

          {/* Legend */}
          <div style={s.legend}>
            <div style={s.legendItem}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#3498db" }}></div>
              <span>Moving Bus</span>
            </div>
            <div style={s.legendItem}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#e74c3c" }}></div>
              <span>Heavy Congestion</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={s.footer}>
          © 2026, M2B. Developed by BSCPE Students, Bulacan State University.
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        button:hover {
          opacity: 0.9;
        }
        input:focus {
          border-color: #4ea3ff;
          box-shadow: 0 0 0 2px rgba(78,163,255,0.1);
        }
      `}</style>
    </div>
  );
}

export default Tracking;