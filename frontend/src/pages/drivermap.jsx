import React, { useState, useEffect } from "react";
import "../css/drivermap.css";

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="dmp-clock">
      <div className="dmp-clock-time">{timeStr}</div>
      <div className="dmp-clock-date">{dateStr}</div>
    </div>
  );
}

function DriverMap() {
  return (
    <div className="dmp-root">

      {/* LEFT PANEL — desktop only */}
      <div className="dmp-left">

        {/* Clock + Logo — desktop */}
        <div className="dmp-clock-wrap">
          <LiveClock />
        </div>
        <div className="dmp-logo">
          <div className="dmp-logo-seg seg-m">M</div>
          <div className="dmp-logo-seg seg-2">2</div>
          <div className="dmp-logo-seg seg-b">B</div>
        </div>

        <div className="dmp-section-title">TRIP DETAILS</div>

        {/* Driver */}
        <div className="dmp-detail-card">
          <div className="dmp-detail-label">DRIVER</div>
          <div className="dmp-driver-name">Mario Santos</div>
        </div>

        {/* Times */}
        <div className="dmp-times-row">
          <div className="dmp-time-block">
            <div className="dmp-detail-label">DEPARTURE TIME</div>
            <div className="dmp-time-value">10:15 AM</div>
            <div className="dmp-time-underline green" />
          </div>
          <div className="dmp-time-block">
            <div className="dmp-detail-label">EXPECTED ARRIVAL TIME</div>
            <div className="dmp-time-value">11:15 AM</div>
            <div className="dmp-time-underline gray" />
          </div>
        </div>

        {/* Origin / Destination */}
        <div className="dmp-tag-row">
          <div className="dmp-tag-block origin">
            <div className="dmp-tag-label">ORIGIN</div>
            <div className="dmp-tag-value">Malolos</div>
          </div>
          <div className="dmp-tag-block destination">
            <div className="dmp-tag-label">DESTINATION</div>
            <div className="dmp-tag-value">Trinoma</div>
          </div>
        </div>

        {/* Status / Congestion */}
        <div className="dmp-tag-row">
          <div className="dmp-tag-block status-on">
            <div className="dmp-tag-label">STATUS</div>
            <div className="dmp-tag-value">On Time</div>
          </div>
          <div className="dmp-tag-block congestion">
            <div className="dmp-tag-label">CONGESTION LEVEL</div>
            <div className="dmp-tag-value">Moderate</div>
          </div>
        </div>

        {/* Bus no + passengers */}
        <div className="dmp-info-row">
          <div className="dmp-info-block dark">
            <div className="dmp-info-top">BUS NO.</div>
            <div className="dmp-info-number">101</div>
            <div className="dmp-info-sub">Plate No. GBC-0021</div>
          </div>
          <div className="dmp-info-block dark">
            <div className="dmp-info-top">NUMBER OF PASSENGERS</div>
            <div className="dmp-info-number">70</div>
          </div>
        </div>

        <button className="dmp-end-btn">END TRIP</button>

        <button className="dmp-emergency-btn">
          <span className="dmp-emergency-icon">📞</span>
          Emergency Call
        </button>

      </div>{/* /dmp-left */}

      {/* RIGHT PANEL — map */}
      <div className="dmp-right">

        {/* Overlays for tablet/mobile — float on top of map */}
        <div className="dmp-map-logo">
          <div className="dmp-logo-seg seg-m">M</div>
          <div className="dmp-logo-seg seg-2">2</div>
          <div className="dmp-logo-seg seg-b">B</div>
        </div>
        <div className="dmp-map-clock">
          <LiveClock />
        </div>

        {/* Your map component goes here */}

      </div>

      {/* BOTTOM PANEL — tablet/mobile only */}
      <div className="dmp-bottom">

        <div className="dmp-section-title">TRIP DETAILS</div>

        {/* ── TABLET layout: bus+passengers left col, driver+times right col ── */}
        <div className="dmp-tablet-grid">

          {/* Left col: bus + passengers stacked */}
          <div className="dmp-tablet-left-col">
            <div className="dmp-info-block dark">
              <div className="dmp-info-top">BUS NO.</div>
              <div className="dmp-info-number">101</div>
              <div className="dmp-info-sub">Plate No. GBC-0021</div>
            </div>
            <div className="dmp-info-block dark">
              <div className="dmp-info-top">NUMBER OF PASSENGERS</div>
              <div className="dmp-info-number">101</div>
            </div>
          </div>

          {/* Right col: driver card + times */}
          <div className="dmp-tablet-right-col">
            <div className="dmp-detail-card">
              <div className="dmp-detail-label">DRIVER</div>
              <div className="dmp-driver-name">Mario Santos</div>
            </div>
            <div className="dmp-times-row">
              <div className="dmp-time-block">
                <div className="dmp-detail-label">DEPARTURE TIME</div>
                <div className="dmp-time-value">10:15 AM</div>
                <div className="dmp-time-underline green" />
              </div>
              <div className="dmp-time-block">
                <div className="dmp-detail-label">EXPECTED ARRIVAL TIME</div>
                <div className="dmp-time-value">11:15 AM</div>
                <div className="dmp-time-underline gray" />
              </div>
            </div>
          </div>

        </div>{/* /dmp-tablet-grid */}

        {/* Tag rows — full width, shown in both tablet and mobile */}
        <div className="dmp-tag-row">
          <div className="dmp-tag-block origin">
            <div className="dmp-tag-label">ORIGIN</div>
            <div className="dmp-tag-value">Malolos</div>
          </div>
          <div className="dmp-tag-block destination">
            <div className="dmp-tag-label">DESTINATION</div>
            <div className="dmp-tag-value">Trinoma</div>
          </div>
          <div className="dmp-tag-block status-on">
            <div className="dmp-tag-label">STATUS</div>
            <div className="dmp-tag-value">On Time</div>
          </div>
          <div className="dmp-tag-block congestion">
            <div className="dmp-tag-label">CONGESTION LEVEL</div>
            <div className="dmp-tag-value">Moderate</div>
          </div>
        </div>

        {/* ── MOBILE-only stacked layout ── */}
        <div className="dmp-mobile-stack">
          <div className="dmp-detail-card">
            <div className="dmp-detail-label">DRIVER</div>
            <div className="dmp-driver-name">Mario Santos</div>
          </div>
          <div className="dmp-times-row">
            <div className="dmp-time-block">
              <div className="dmp-detail-label">DEPARTURE TIME</div>
              <div className="dmp-time-value">10:15 AM</div>
              <div className="dmp-time-underline green" />
            </div>
            <div className="dmp-time-block">
              <div className="dmp-detail-label">EXPECTED ARRIVAL TIME</div>
              <div className="dmp-time-value">11:15 AM</div>
              <div className="dmp-time-underline gray" />
            </div>
          </div>
          <div className="dmp-info-row">
            <div className="dmp-info-block dark">
              <div className="dmp-info-top">BUS NO.</div>
              <div className="dmp-info-number">101</div>
              <div className="dmp-info-sub">Plate No. GBC-0021</div>
            </div>
            <div className="dmp-info-block dark">
              <div className="dmp-info-top">NUMBER OF PASSENGERS</div>
              <div className="dmp-info-number">101</div>
            </div>
          </div>
          <div className="dmp-tag-row">
            <div className="dmp-tag-block origin">
              <div className="dmp-tag-label">ORIGIN</div>
              <div className="dmp-tag-value">Malolos</div>
            </div>
            <div className="dmp-tag-block destination">
              <div className="dmp-tag-label">DESTINATION</div>
              <div className="dmp-tag-value">Trinoma</div>
            </div>
          </div>
          <div className="dmp-tag-row">
            <div className="dmp-tag-block status-on">
              <div className="dmp-tag-label">STATUS</div>
              <div className="dmp-tag-value">On Time</div>
            </div>
            <div className="dmp-tag-block congestion">
              <div className="dmp-tag-label">CONGESTION LEVEL</div>
              <div className="dmp-tag-value">Moderate</div>
            </div>
          </div>
        </div>{/* /dmp-mobile-stack */}

        <button className="dmp-emergency-btn">
          <span className="dmp-emergency-icon">📞</span>
          Emergency Call
        </button>

      </div>{/* /dmp-bottom */}

    </div>
  );
}

export default DriverMap;
