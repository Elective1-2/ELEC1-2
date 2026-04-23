import React, { useState, useEffect } from 'react';
import '../../css/BusModal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function DriverAssignModal({ isOpen, onClose, driver, buses, routes, onAssign }) {
  const [formData, setFormData] = useState({
    bus_id: '',
    route_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && driver) {
      // Check if driver has active assignment
      const activeAssignment = driver.assignments?.find(a => a.is_active === 1);
      
      if (activeAssignment) {
        setFormData({
          bus_id: activeAssignment.bus_id || '',
          route_id: activeAssignment.route_id || ''
        });
      } else {
        setFormData({ bus_id: '', route_id: '' });
      }
      setError('');
    }
  }, [isOpen, driver]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bus_id || !formData.route_id) {
      setError('Please select both bus and route');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/drivers/${driver.user_id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bus_id: parseInt(formData.bus_id),
          route_id: parseInt(formData.route_id)
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign driver');
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

  // Filter only active buses
  const activeBuses = buses.filter(b => b.status === 'active');

  return (
    <div className="bus-modal-overlay" onClick={onClose}>
      <div className="bus-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bus-modal-header">
          <h2>Assign Driver: {driver?.full_name}</h2>
          <button className="bus-modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="bus-modal-body">
            {error && <div className="bus-modal-error">{error}</div>}
            
            <div className="bus-form-group">
              <label>Select Bus <span className="required">*</span></label>
              <select 
                value={formData.bus_id} 
                onChange={(e) => setFormData(prev => ({ ...prev, bus_id: e.target.value }))} 
                required
                disabled={loading}
              >
                <option value="">-- Select Bus --</option>
                {activeBuses.map(bus => (
                  <option key={bus.bus_id} value={bus.bus_id}>
                    {bus.bus_number} - {bus.plate_number || 'No plate'} ({bus.capacity} seats)
                  </option>
                ))}
              </select>
              {activeBuses.length === 0 && (
                <small className="bus-form-hint">No active buses available</small>
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
                    {route.name} ({route.start_location} → {route.end_location})
                  </option>
                ))}
              </select>
            </div>
            
            {driver?.assignments?.length > 0 && (
              <div className="bus-form-info">
                <small>Current assignment will be replaced with this new assignment.</small>
              </div>
            )}
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
              disabled={loading || activeBuses.length === 0}
            >
              {loading ? 'Assigning...' : 'Assign Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DriverAssignModal;