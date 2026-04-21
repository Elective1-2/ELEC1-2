import React, { useState } from 'react';

function BusNumberModal({ isOpen, onClose, onSubmit, error }) {
  const [busNumber, setBusNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!busNumber.trim()) return;

    setIsSubmitting(true);
    const success = await onSubmit(busNumber.trim());
    setIsSubmitting(false);

    if (success) {
      setBusNumber('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dmp-modal-overlay" onClick={onClose}>
      <div className="dmp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dmp-modal-header">
          <h2>Track Your Bus</h2>
          <button className="dmp-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="dmp-modal-body">
          <p>Enter the bus number to track its current location and ETA.</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="dmp-modal-input"
              placeholder="e.g., 101, 102, 103"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              autoFocus
              disabled={isSubmitting}
            />
            {error && (
              <div className="dmp-modal-error">
                ⚠️ {error}
              </div>
            )}
            <button 
              type="submit" 
              className="dmp-modal-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Tracking...' : 'Track Bus'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BusNumberModal;