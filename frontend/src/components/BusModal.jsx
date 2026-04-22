import React, { useState, useEffect } from 'react';
import '../css/BusModal.css';

function BusModal({ isOpen, onClose, bus, onSubmit, title }) {
  const [formData, setFormData] = useState({
    bus_number: '',
    plate_number: '',
    capacity: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (bus) {
        setFormData({
          bus_number: bus.bus_number || '',
          plate_number: bus.plate_number || '',
          capacity: bus.capacity || '',
          status: bus.status || 'active'
        });
      } else {
        setFormData({
          bus_number: '',
          plate_number: '',
          capacity: '',
          status: 'active'
        });
      }
      setError('');
    }
  }, [isOpen, bus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.bus_number || !formData.capacity) {
      setError('Bus number and capacity are required');
      return;
    }
    
    // Validate capacity is a positive number
    const capacityNum = parseInt(formData.capacity);
    if (isNaN(capacityNum) || capacityNum < 1) {
      setError('Capacity must be a valid number (at least 1)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Prepare data - convert empty plate_number to null
    const submitData = {
      bus_number: formData.bus_number.trim(),
      plate_number: formData.plate_number?.trim() || null,
      capacity: capacityNum,
      status: formData.status
    };
    
    const result = await onSubmit(submitData);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="bus-modal-overlay" onClick={onClose}>
      <div className="bus-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bus-modal-header">
          <h2>{title || (bus ? 'Edit Bus' : 'Add New Bus')}</h2>
          <button className="bus-modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="bus-modal-body">
            {error && <div className="bus-modal-error">{error}</div>}
            
            <div className="bus-form-group">
              <label>Bus Number <span className="required">*</span></label>
              <input
                type="text"
                name="bus_number"
                value={formData.bus_number}
                onChange={handleChange}
                placeholder="e.g., 101"
                disabled={loading}
                required
              />
            </div>
            
            <div className="bus-form-group">
              <label>Plate Number (Optional)</label>
              <input
                type="text"
                name="plate_number"
                value={formData.plate_number}
                onChange={handleChange}
                placeholder="e.g., ABC-1234"
                disabled={loading}
              />
              <small className="bus-form-hint">Leave blank if not available</small>
            </div>
            
            <div className="bus-form-group">
              <label>Capacity <span className="required">*</span></label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="e.g., 50"
                min="1"
                max="100"
                disabled={loading}
                required
              />
              <small className="bus-form-hint">Number of seats</small>
            </div>
            
            {bus && (
              <div className="bus-form-group">
                <label>Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  disabled={loading}
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
                <small className="bus-form-hint">
                  {formData.status === 'active' && 'Bus is available for assignments'}
                  {formData.status === 'maintenance' && 'Bus is under maintenance, cannot be assigned'}
                  {formData.status === 'retired' && 'Bus is retired, will not appear in active lists'}
                </small>
              </div>
            )}
            
            {!bus && (
              <div className="bus-form-info">
                <small>New buses are created with "active" status by default.</small>
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
              disabled={loading}
            >
              {loading ? 'Saving...' : (bus ? 'Update Bus' : 'Create Bus')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BusModal;