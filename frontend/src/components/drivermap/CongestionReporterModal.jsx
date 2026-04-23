import { useState } from 'react';

const congestionLevels = [
  { value: 'low', label: 'Low', color: '#10b981', description: 'Free flowing traffic' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', description: 'Moderate traffic' },
  { value: 'high', label: 'High', color: '#ef4444', description: 'Heavy traffic' },
  { value: 'full', label: 'Full', color: '#991b1b', description: 'Standstill / Gridlock' }
];

const CongestionReporterModal = ({ isOpen, onClose, onSubmit, currentLevel = 'low' }) => {
  const [selectedLevel, setSelectedLevel] = useState(currentLevel);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(selectedLevel);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Report Traffic Congestion</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="congestion-options">
            {congestionLevels.map(level => (
              <div
                key={level.value}
                className={`congestion-option ${selectedLevel === level.value ? 'selected' : ''}`}
                onClick={() => setSelectedLevel(level.value)}
                style={{
                  padding: '16px',
                  marginBottom: '12px',
                  border: '2px solid',
                  borderColor: selectedLevel === level.value ? level.color : '#e5e7eb',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: selectedLevel === level.value ? `${level.color}10` : 'white',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: level.color
                  }} />
                  <span style={{ fontWeight: '700', color: '#111827' }}>{level.label}</span>
                </div>
                <p style={{ margin: '0 0 0 24px', fontSize: '13px', color: '#6b7280' }}>
                  {level.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Reporting...' : 'Report Congestion'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CongestionReporterModal;