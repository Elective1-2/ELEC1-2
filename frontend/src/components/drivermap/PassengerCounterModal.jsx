import { useState } from 'react';
import '../../css/drivermap.css';

const PassengerCounterModal = ({ isOpen, onClose, onSubmit, currentCount = 0, busCapacity = 50 }) => {
  const [passengerCount, setPassengerCount] = useState(currentCount);
  const [isOverflow, setIsOverflow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(passengerCount, isOverflow);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const isNearCapacity = passengerCount >= busCapacity * 0.9;
  const isOverCapacity = passengerCount > busCapacity;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Update Passenger Count</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Number of Passengers</label>
            <input
              type="number"
              min="0"
              max={busCapacity + 20}
              value={passengerCount}
              onChange={(e) => setPassengerCount(parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>
          
          {isNearCapacity && !isOverCapacity && (
            <div className="warning-message" style={{ color: '#f59e0b', marginBottom: '16px' }}>
              ⚠️ Approaching capacity ({passengerCount}/{busCapacity})
            </div>
          )}
          
          {isOverCapacity && (
            <div className="warning-message" style={{ color: '#ef4444', marginBottom: '16px' }}>
              ⚠️ Over capacity! Please mark as overflow
            </div>
          )}
          
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={isOverflow}
                onChange={(e) => setIsOverflow(e.target.checked)}
              />
              Mark as overflow
            </label>
          </div>
          
          <div className="capacity-info">
            Bus Capacity: {busCapacity} passengers
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Updating...' : 'Update Count'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerCounterModal;