import LiveClock from './LiveClock';
import { Link } from 'react-router-dom';

function TripDetailsBottom({ tripData, formatTime, statusInfo, congestionLevel, onTrackAnother, isOpen, onToggle }) {
  return (
    <div className={`dmp-bottom ${isOpen ? 'open' : 'closed'}`}>
      <div className="dmp-bottom-handle" onClick={onToggle}>
        <div className="dmp-bottom-handle-bar" />
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`dmp-bottom-chevron ${isOpen ? 'open' : 'closed'}`}
        >
          <polyline points="6 15 12 9 18 15" />
        </svg>
      </div>

      <div className="dmp-section-title">ACTIVE TRIP DETAILS</div>

      {tripData ? (
        <>
          <div className="dmp-tablet-grid">
            <div className="dmp-tablet-left-col">
              <div className="dmp-info-block dark full-width">
                <div className="dmp-info-top">BUS NO.</div>
                <div className="dmp-info-number">{tripData.bus?.busNumber || '—'}</div>
                <div className="dmp-info-sub">Capacity: {tripData.bus?.capacity || '—'}</div>
              </div>
            </div>
            <div className="dmp-tablet-right-col">
              <div className="dmp-times-container">
                <div className="dmp-times-row">
                  <div className="dmp-time-block">
                    <div className="dmp-detail-label">DEPARTURE TIME</div>
                    <div className="dmp-time-value">
                      {formatTime(tripData.trip?.scheduledDeparture)}
                    </div>
                    <div className="dmp-time-underline green" />
                  </div>
                  <div className="dmp-time-block">
                    <div className="dmp-detail-label">EXPECTED ARRIVAL TIME</div>
                    <div className="dmp-time-value">
                      {tripData.eta?.text || '—'}
                    </div>
                    <div className="dmp-time-underline gray" />
                  </div>
                </div>
              </div>
              <div className="dmp-detail-card">
                <div className="dmp-detail-label">DRIVER</div>
                <div className="dmp-driver-name">
                  {tripData.driver?.name || '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="dmp-tag-row">
            <div className="dmp-tag-block origin">
              <div className="dmp-tag-label">ORIGIN</div>
              <div className="dmp-tag-value">
                {tripData.trip?.startLocation?.split(',')[0] || '—'}
              </div>
            </div>
            <div className="dmp-tag-block destination">
              <div className="dmp-tag-label">DESTINATION</div>
              <div className="dmp-tag-value">
                {tripData.trip?.endLocation?.split(',')[0] || '—'}
              </div>
            </div>
            <div className={`dmp-tag-block ${statusInfo.class}`}>
              <div className="dmp-tag-label">STATUS</div>
              <div className="dmp-tag-value">{statusInfo.text}</div>
            </div>
            <div className="dmp-tag-block congestion">
              <div className="dmp-tag-label">CONGESTION LEVEL</div>
              <div className="dmp-tag-value">{congestionLevel}</div>
            </div>
          </div>

          <button className="dmp-track-another-btn" onClick={onTrackAnother}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            Track Another Bus
          </button>

          <div className="dmp-mobile-stack">
            <div className="dmp-info-block dark full-width">
              <div className="dmp-info-top">BUS NO.</div>
              <div className="dmp-info-number">{tripData.bus?.busNumber || '—'}</div>
              <div className="dmp-info-sub">Capacity: {tripData.bus?.capacity || '—'}</div>
            </div>
            <div className="dmp-tag-row">
              <div className="dmp-tag-block origin">
                <div className="dmp-tag-label">ORIGIN</div>
                <div className="dmp-tag-value">
                  {tripData.trip?.startLocation?.split(',')[0] || '—'}
                </div>
              </div>
              <div className="dmp-tag-block destination">
                <div className="dmp-tag-label">DESTINATION</div>
                <div className="dmp-tag-value">
                  {tripData.trip?.endLocation?.split(',')[0] || '—'}
                </div>
              </div>
            </div>
            <div className="dmp-tag-row">
              <div className={`dmp-tag-block ${statusInfo.class}`}>
                <div className="dmp-tag-label">STATUS</div>
                <div className="dmp-tag-value">{statusInfo.text}</div>
              </div>
              <div className="dmp-tag-block congestion">
                <div className="dmp-tag-label">CONGESTION LEVEL</div>
                <div className="dmp-tag-value">{congestionLevel}</div>
              </div>
            </div>
            <div className="dmp-times-container">
              <div className="dmp-times-row">
                <div className="dmp-time-block">
                  <div className="dmp-detail-label">DEPARTURE TIME</div>
                  <div className="dmp-time-value">
                    {formatTime(tripData.trip?.scheduledDeparture)}
                  </div>
                  <div className="dmp-time-underline green" />
                </div>
                <div className="dmp-time-block">
                  <div className="dmp-detail-label">EXPECTED ARRIVAL TIME</div>
                  <div className="dmp-time-value">
                    {tripData.eta?.text || '—'}
                  </div>
                  <div className="dmp-time-underline gray" />
                </div>
              </div>
            </div>
            <div className="dmp-detail-card">
              <div className="dmp-detail-label">DRIVER</div>
              <div className="dmp-driver-name">
                {tripData.driver?.name || '—'}
              </div>
            </div>

            <button className="dmp-track-another-btn" onClick={onTrackAnother}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              Track Another Bus
            </button>
          </div>
        </>
      ) : (
        <div className="dmp-info-block dark full-width">
          <div className="dmp-info-top">NO BUS TRACKED</div>
          <div className="dmp-info-number">—</div>
          <div className="dmp-info-sub">
            <button className="dmp-track-btn-inline" onClick={onTrackAnother}>
              Track a Bus
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripDetailsBottom;