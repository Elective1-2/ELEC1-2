import React, { useState, useEffect } from 'react';
import '../css/BusModal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AssignmentModal({ isOpen, onClose, bus, drivers, routes, onAssign }) {
  const [formData, setFormData] = useState({
    driver_id: '',
    route_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or bus changes
  useEffect(() => {
    if (isOpen && bus) {
      // Check if bus has active assignment
      const activeAssignment = bus.assignments?.find(a => a.is_active === 1);
      
      if (activeAssignment) {
        setFormData({
          driver_id: activeAssignment.driver_id || '',
          route_id: activeAssignment.route_id || ''
        });
      } else {
        setFormData({ driver_id: '', route_id: '' });
      }
      setError('');
    }
  }, [isOpen, bus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.driver_id || !formData.route_id) {
      setError('Please select both driver and route');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/buses/${bus.bus_id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          driver_id: parseInt(formData.driver_id),
          route_id: parseInt(formData.route_id)
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign bus');
      }
      
      onAssign?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter only active drivers
  const activeDrivers = drivers.filter(d => d.is_active === 1);

  return (
    <div className="bus-modal-overlay" onClick={onClose}>
      <div className="bus-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bus-modal-header">
          <h2>Assign Bus {bus?.bus_number}</h2>
          <button className="bus-modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="bus-modal-body">
            {error && <div className="bus-modal-error">{error}</div>}
            
            <div className="bus-form-group">
              <label>Select Driver <span className="required">*</span></label>
              <select 
                value={formData.driver_id} 
                onChange={(e) => setFormData(prev => ({ ...prev, driver_id: e.target.value }))} 
                required
                disabled={loading}
              >
                <option value="">-- Select Driver --</option>
                {activeDrivers.map(driver => (
                  <option key={driver.user_id} value={driver.user_id}>
                    {driver.full_name}
                  </option>
                ))}
              </select>
              {activeDrivers.length === 0 && (
                <small className="bus-form-hint">No active drivers available</small>
              )}
            </div>
            
            <div className="bus-form-group">
              <label>Select Route <span className="required">*</span></label>
              <select 
                value={formData.route_id} 
                onChange={(e) => setFormData(prev => ({ ...prev, route_id: e.target.value }))} 
                required
                disabled={loading}
              >
                <option value="">-- Select Route --</option>
                {routes.map(route => (
                  <option key={route.route_id} value={route.route_id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="bus-modal-footer">
            <button 
              type="button" 
              className="bus-modal-cancel" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bus-modal-submit" 
              disabled={loading || activeDrivers.length === 0}
            >
              {loading ? 'Assigning...' : 'Assign Bus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignmentModal;