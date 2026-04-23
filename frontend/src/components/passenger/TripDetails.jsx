import { Link } from 'react-router-dom';
import LiveClock from './LiveClock';

function TripDetails({ tripData, formatTime, statusInfo, congestionLevel, onTrackAnother }) {
  return (
    <div className="dmp-left">
      <div className="dmp-clock-wrap">
        <LiveClock />
      </div>
      <Link to={"/"}>
        <div className="dmp-logo">
          <div className="dmp-logo-seg seg-m">M</div>
          <div className="dmp-logo-seg seg-2">2</div>
          <div className="dmp-logo-seg seg-b">B</div>
        </div>
      </Link>
      <div className="dmp-section-title">ACTIVE TRIP DETAILS</div>

      {tripData ? (
        <>
          <div className="dmp-info-block dark full-width">
            <div className="dmp-info-top">BUS NO.</div>
            <div className="dmp-info-number">{tripData.bus?.busNumber || '—'}</div>
            <div className="dmp-info-sub">Capacity: {tripData.bus?.capacity || '—'} passengers</div>
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

export default TripDetails;