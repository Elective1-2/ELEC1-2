import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { font-family: 'Inter', sans-serif; background: #eef0f3; height: 100%; }
  .app { display: flex; min-height: 100vh; }

  /* ── SIDEBAR ── */
  .sidebar {
    width: 185px; min-width: 185px;
    background: #253447;
    display: flex; flex-direction: column;
    padding: 22px 0 0 0;
  }
  .logo-wrap {
    display: flex; align-items: center; gap: 4px;
    padding: 0 18px 28px 18px;
  }
  .lseg {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 18px; line-height: 1; flex-shrink: 0;
  }
  .lseg-m { background: #2d4159; color: #fff; }
  .lseg-2 { background: #4ba3d4; color: #fff; }
  .lseg-b { background: #d4a017; color: #fff; }

  .nav-link {
    margin: 2px 8px; padding: 10px 14px;
    color: #8fa4be; font-size: 14px; font-weight: 500;
    border-radius: 8px; cursor: pointer;
    transition: background 0.15s, color 0.15s; user-select: none;
  }
  .nav-link:hover { background: rgba(255,255,255,0.07); color: #fff; }
  .nav-link.active { background: #3b82f6; color: #fff; }

  /* ── MAIN ── */
  .main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

  /* TOPBAR */
  .topbar {
    background: #fff; padding: 11px 24px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid #e2e5ea; flex-shrink: 0;
  }
  .search {
    display: flex; align-items: center; gap: 7px;
    background: #f3f4f6; border: 1px solid #e2e5ea;
    border-radius: 8px; padding: 7px 11px; width: 230px;
  }
  .search input { border: none; background: transparent; outline: none; font-size: 13px; color: #374151; width: 100%; font-family: inherit; }
  .tb-right { display: flex; align-items: center; gap: 12px; }
  .admin-label { text-align: right; }
  .admin-name  { font-size: 13px; font-weight: 700; color: #111827; }
  .admin-role  { font-size: 11px; color: #6b7280; }
  .avatar { width: 33px; height: 33px; border-radius: 50%; background: #374151; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .notif-btn { position: relative; background: none; border: none; cursor: pointer; display: flex; align-items: center; padding: 2px; }
  .notif-badge { position: absolute; top: 0; right: 0; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; }

  /* CONTENT */
  .content { padding: 24px; flex: 1; overflow-y: auto; }
  .page-title { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 20px; }

  /* STAT CARDS */
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .stat-card { background: #fff; border-radius: 14px; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
  .stat-lbl { font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 4px; }
  .stat-val { font-size: 24px; font-weight: 700; color: #111827; line-height: 1.1; }
  .stat-icon-box { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .bg-navy   { background: #1e3354; }
  .bg-green  { background: #22c55e; }
  .bg-orange { background: #f97316; }
  .bg-red    { background: #ef4444; }

  /* MAP */
  .map-card { background: #fff; border-radius: 14px; padding: 18px 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
  .map-title { font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 14px; }
  .map-body { position: relative; height: 230px; background: #f8f9fa; border-radius: 10px; overflow: hidden; }
  .route-band { position: absolute; top: 50%; left: 3%; width: 94%; height: 14px; border-radius: 7px; transform: translateY(-50%) rotate(-7deg); background: linear-gradient(to right, #ef4444 30%, #22c55e 65%); }
  .bus-pin { position: absolute; display: flex; flex-direction: column; align-items: center; gap: 3px; }
  .pin-card { background: #fff; border: 1px solid #e2e5ea; border-radius: 7px; padding: 3px 8px; font-size: 10px; font-weight: 700; color: #111827; white-space: nowrap; box-shadow: 0 1px 4px rgba(0,0,0,0.12); line-height: 1.6; }
  .pin-sub { display: block; font-size: 9px; font-weight: 500; }
  .c-green { color: #16a34a; } .c-blue { color: #2563eb; } .c-red { color: #dc2626; }
  .pin-dot { width: 11px; height: 11px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.25); }
  .d-blue { background: #3b82f6; } .d-red { background: #ef4444; }
  .map-legend { position: absolute; bottom: 10px; right: 12px; display: flex; gap: 14px; }
  .leg-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #6b7280; }
  .leg-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  /* FOOTER */
  .footer { text-align: center; font-size: 11px; color: #9ca3af; padding: 12px 24px; background: #fff; border-top: 1px solid #e2e5ea; flex-shrink: 0; }

  /* MOBILE HEADER */
  .mob-header {
    display: none; background: #253447; padding: 12px 16px;
    align-items: center; justify-content: space-between; flex-shrink: 0;
  }
  .mob-left { display: flex; align-items: center; gap: 10px; }
  .hamburger { background: none; border: none; cursor: pointer; color: #fff; display: flex; flex-direction: column; gap: 5px; padding: 2px; }
  .ham-line { width: 22px; height: 2.5px; background: #fff; border-radius: 2px; display: block; }
  .overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 50; }
  .overlay.open { display: block; }

  /* RESPONSIVE */
  @media (max-width: 799px) {
    .sidebar { display: none; position: fixed; top: 0; left: 0; height: 100vh; z-index: 60; width: 190px; min-width: 190px; padding-top: 16px; }
    .sidebar.open { display: flex; }
    .mob-header { display: flex; }
    .app { flex-direction: column; }
    .main { width: 100%; }
    .stats-grid { grid-template-columns: 1fr; gap: 10px; }
    .content { padding: 14px; }
    .page-title { font-size: 18px; margin-bottom: 12px; }
    .topbar { padding: 9px 14px; }
    .search { width: 155px; }
    .map-body { height: 180px; }
    .stat-val { font-size: 20px; }
    .stat-icon-box { width: 48px; height: 48px; }
  }
  @media (min-width: 800px) and (max-width: 1279px) {
    .sidebar { width: 168px; min-width: 168px; }
    .content { padding: 20px; }
    .page-title { font-size: 20px; }
  }
`;

/* ─────────────────────────────────────────────────
   ICON 1: Person sitting SIDEWAYS (profile view)
   - round head top-right
   - torso leaning back on seat-back (left side)
   - thighs horizontal on seat
   - lower legs dangling down-right
   - armrest shape on right
───────────────────────────────────────────────── */
const IconPassenger = () => (
  <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
    {/* head - top right area */}
    <circle cx="30" cy="9" r="5.5" fill="white"/>
    {/* seat back - tall vertical slab on left */}
    <path d="M10 14 Q10 12 13 12 L16 12 Q19 12 19 15 L19 38 Q19 40 16 40 L13 40 Q10 40 10 38 Z" fill="white"/>
    {/* seat base - horizontal slab */}
    <path d="M19 30 L38 30 Q40 30 40 33 L40 36 Q40 38 38 38 L19 38 Z" fill="white"/>
    {/* torso - person leaning back, body from seat-back to hips */}
    <path d="M19 16 Q24 13 30 15 L34 28 L19 28 Z" fill="white"/>
    {/* upper arm resting on armrest */}
    <path d="M28 22 Q33 20 37 22 Q39 23 38 26 L34 28 Z" fill="white"/>
    {/* lower legs going down-right from seat edge */}
    <path d="M38 38 Q42 38 42 42 L42 45 Q42 47 39 47 L32 47 Q30 47 30 45 L30 38 Z" fill="white"/>
  </svg>
);

/* ─────────────────────────────────────────────────
   ICON 2: Front-facing bus — detailed & cool
   Large windshield split, mirror ears, wide grille,
   round headlights, thick bumper, side details
───────────────────────────────────────────────── */
const IconBus = () => (
  <svg viewBox="0 0 52 52" width="38" height="38" fill="none">
    {/* main body */}
    <rect x="6" y="8" width="40" height="30" rx="6" fill="white"/>
    {/* roof dome */}
    <rect x="10" y="5" width="32" height="7" rx="4" fill="white"/>
    {/* windshield left pane */}
    <rect x="9" y="12" width="14" height="11" rx="2.5" fill="#22c55e" opacity="0.45"/>
    {/* windshield right pane */}
    <rect x="29" y="12" width="14" height="11" rx="2.5" fill="#22c55e" opacity="0.45"/>
    {/* center pillar between windshields */}
    <rect x="24" y="12" width="4" height="11" rx="1" fill="#22c55e" opacity="0.3"/>
    {/* left side mirror ear */}
    <path d="M6 17 Q2 17 2 21 L2 25 Q2 27 5 27 L6 27 Z" fill="white" opacity="0.85"/>
    {/* right side mirror ear */}
    <path d="M46 17 Q50 17 50 21 L50 25 Q50 27 47 27 L46 27 Z" fill="white" opacity="0.85"/>
    {/* lower face / nose area */}
    <rect x="9" y="28" width="34" height="7" rx="3" fill="white" opacity="0.7"/>
    {/* left headlight — dark recessed shape */}
    <ellipse cx="14" cy="31" rx="5" ry="3.5" fill="#22c55e" opacity="0.5"/>
    <ellipse cx="14" cy="31" rx="3.5" ry="2.5" fill="#bbf7d0" opacity="0.9"/>
    {/* right headlight */}
    <ellipse cx="38" cy="31" rx="5" ry="3.5" fill="#22c55e" opacity="0.5"/>
    <ellipse cx="38" cy="31" rx="3.5" ry="2.5" fill="#bbf7d0" opacity="0.9"/>
    {/* grille center strip */}
    <rect x="20" y="31" width="12" height="3" rx="1.5" fill="#22c55e" opacity="0.45"/>
    {/* bumper bar */}
    <rect x="7" y="37" width="38" height="5" rx="3" fill="white" opacity="0.8"/>
    {/* left wheel */}
    <circle cx="14" cy="46" r="5.5" fill="white"/>
    <circle cx="14" cy="46" r="2.2" fill="#22c55e"/>
    <circle cx="14" cy="46" r="1"   fill="white"/>
    {/* right wheel */}
    <circle cx="38" cy="46" r="5.5" fill="white"/>
    <circle cx="38" cy="46" r="2.2" fill="#22c55e"/>
    <circle cx="38" cy="46" r="1"   fill="white"/>
    {/* destination sign strip on top */}
    <rect x="14" y="6" width="24" height="4" rx="2" fill="#22c55e" opacity="0.35"/>
  </svg>
);

/* ─────────────────────────────────────────────────
   ICON 3: Clock
───────────────────────────────────────────────── */
const IconClock = () => (
  <svg viewBox="0 0 48 48" width="30" height="30" fill="none">
    <circle cx="24" cy="24" r="19" stroke="white" strokeWidth="4" fill="none"/>
    <line x1="24" y1="24" x2="24" y2="10" stroke="white" strokeWidth="4" strokeLinecap="round"/>
    <line x1="24" y1="24" x2="35" y2="24" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
    <circle cx="24" cy="24" r="2.5" fill="white"/>
  </svg>
);

/* ─────────────────────────────────────────────────
   ICON 4: 3 CAR FRONTS
   Layout from reference:
   - 1 smaller car at top-center (rear)
   - 1 large car bottom-left (front-left)
   - 1 medium car bottom-right (front-right)
   All facing FRONT (headlights toward viewer)
───────────────────────────────────────────────── */
const CarFront = ({ x, y, w, opacity = 1 }) => {
  const h = w * 0.72;
  const r = w * 0.1;
  // proportional helpers
  const p = (v) => v * w;
  return (
    <g opacity={opacity} transform={`translate(${x}, ${y})`}>
      {/* main body rectangle */}
      <rect x="0" y={p(0.28)} width={w} height={h * 0.72} rx={r} fill="white"/>
      {/* cabin roof arc */}
      <path
        d={`M${p(0.15)} ${p(0.28)} Q${p(0.2)} ${p(0.02)} ${p(0.45)} 0 Q${p(0.75)} ${p(0.02)} ${p(0.85)} ${p(0.28)} Z`}
        fill="white"
      />
      {/* left window */}
      <path
        d={`M${p(0.18)} ${p(0.28)} Q${p(0.22)} ${p(0.1)} ${p(0.42)} ${p(0.08)} L${p(0.42)} ${p(0.28)} Z`}
        fill="rgba(239,68,68,0.38)"
      />
      {/* right window */}
      <path
        d={`M${p(0.82)} ${p(0.28)} Q${p(0.78)} ${p(0.1)} ${p(0.58)} ${p(0.08)} L${p(0.58)} ${p(0.28)} Z`}
        fill="rgba(239,68,68,0.38)"
      />
      {/* left headlight */}
      <ellipse cx={p(0.2)} cy={p(0.72)} rx={p(0.13)} ry={p(0.09)} fill="rgba(255,230,100,0.9)"/>
      {/* right headlight */}
      <ellipse cx={p(0.8)} cy={p(0.72)} rx={p(0.13)} ry={p(0.09)} fill="rgba(255,230,100,0.9)"/>
      {/* grille */}
      <rect x={p(0.3)} y={p(0.68)} width={p(0.4)} height={p(0.1)} rx={p(0.04)} fill="rgba(239,68,68,0.4)"/>
      {/* bumper */}
      <rect x={p(0.05)} y={p(0.84)} width={p(0.9)} height={p(0.1)} rx={p(0.04)} fill="white" opacity="0.7"/>
      {/* left wheel arch */}
      <ellipse cx={p(0.18)} cy={p(1.0)} rx={p(0.16)} ry={p(0.12)} fill="white"/>
      {/* right wheel arch */}
      <ellipse cx={p(0.82)} cy={p(1.0)} rx={p(0.16)} ry={p(0.12)} fill="white"/>
    </g>
  );
};

const IconCongestion = () => (
  <svg viewBox="0 0 64 56" width="42" height="36" fill="none">
    {/* back center car — smaller, slightly transparent */}
    <CarFront x={16} y={0}  w={32} opacity={0.72}/>
    {/* front left car — largest */}
    <CarFront x={0}  y={24} w={34} opacity={1}/>
    {/* front right car — medium */}
    <CarFront x={36} y={26} w={28} opacity={1}/>
  </svg>
);

const BUSES = [
  { id:"Bus #102", sub:"On Time",  subCls:"c-green", dot:"d-blue", left:"55%", top:"22%" },
  { id:"Bus #42",  sub:"En Route", subCls:"c-blue",  dot:"d-blue", left:"30%", top:"45%" },
  { id:"Bus #88",  sub:"+5m Late", subCls:"c-red",   dot:"d-red",  left:"70%", top:"60%" },
];

export default function M2BDashboard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{styles}</style>
      <div className={`overlay${open ? " open" : ""}`} onClick={() => setOpen(false)}/>

      <div className="app">
        {/* Mobile header: hamburger LEFT of logo */}
        <div className="mob-header">
          <div className="mob-left">
            <button className="hamburger" onClick={() => setOpen(v => !v)}>
              <span className="ham-line"/>
              <span className="ham-line"/>
              <span className="ham-line"/>
            </button>
            <div className="logo-wrap" style={{paddingBottom:0}}>
              <div className="lseg lseg-m">M</div>
              <div className="lseg lseg-2">2</div>
              <div className="lseg lseg-b">B</div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`sidebar${open ? " open" : ""}`}>
          <div className="logo-wrap">
            <div className="lseg lseg-m">M</div>
            <div className="lseg lseg-2">2</div>
            <div className="lseg lseg-b">B</div>
          </div>
          {["Dashboard","Live Tracking","Analytics","Management"].map(n => (
            <div key={n} className={`nav-link${n==="Dashboard"?" active":""}`}
                 onClick={() => setOpen(false)}>{n}</div>
          ))}
        </div>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div className="search">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="5.5" cy="5.5" r="4" stroke="#9ca3af" strokeWidth="1.5"/>
                <line x1="8.5" y1="8.5" x2="12" y2="12" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input placeholder="Search bus number"/>
              <span style={{color:"#9ca3af",cursor:"pointer",fontSize:12}}>✕</span>
            </div>
            <div className="tb-right">
              <div className="admin-label">
                <div className="admin-name">Admin123</div>
                <div className="admin-role">Admin</div>
              </div>
              <div className="avatar">
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <circle cx="8.5" cy="6" r="3.2" fill="#9ca3af"/>
                  <path d="M1.5 16c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5" stroke="#9ca3af" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <button className="notif-btn">
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                  <path d="M9.5 2a5.5 5.5 0 00-5.5 5.5V11L2.5 13h14L15 11V7.5A5.5 5.5 0 009.5 2z" fill="#374151"/>
                  <path d="M7.5 14.5a2 2 0 004 0" fill="#374151"/>
                </svg>
                <span className="notif-badge"/>
              </button>
            </div>
          </div>

          <div className="content">
            <div className="page-title">Welcome back, Admin123!</div>

            <div className="stats-grid">
              <div className="stat-card">
                <div><div className="stat-lbl">Total Passengers</div><div className="stat-val">0.0 mins</div></div>
                <div className="stat-icon-box bg-navy"><IconPassenger/></div>
              </div>
              <div className="stat-card">
                <div><div className="stat-lbl">Active Buses</div><div className="stat-val">24</div></div>
                <div className="stat-icon-box bg-green"><IconBus/></div>
              </div>
              <div className="stat-card">
                <div><div className="stat-lbl">Average Delay</div><div className="stat-val">0.0 mins</div></div>
                <div className="stat-icon-box bg-orange"><IconClock/></div>
              </div>
              <div className="stat-card">
                <div><div className="stat-lbl">Congestion Level</div><div className="stat-val">HEAVY</div></div>
                <div className="stat-icon-box bg-red"><IconCongestion/></div>
              </div>
            </div>

            <div className="map-card">
              <div className="map-title">Live Transit Map</div>
              <div className="map-body">
                <div className="route-band"/>
                {BUSES.map(b => (
                  <div key={b.id} className="bus-pin"
                       style={{left:b.left, top:b.top, transform:"translate(-50%,-50%)"}}>
                    <div className="pin-card">
                      {b.id}<span className={`pin-sub ${b.subCls}`}>{b.sub}</span>
                    </div>
                    <div className={`pin-dot ${b.dot}`}/>
                  </div>
                ))}
                <div className="map-legend">
                  <div className="leg-item"><div className="leg-dot" style={{background:"#3b82f6"}}/>Moving Bus</div>
                  <div className="leg-item"><div className="leg-dot" style={{background:"#ef4444"}}/>Heavy Congestion</div>
                </div>
              </div>
            </div>
          </div>

          <div className="footer">2026, M2B. Developed by BSCpE Students, Bulacan State University.</div>
        </div>
      </div>
    </>
  );
}
