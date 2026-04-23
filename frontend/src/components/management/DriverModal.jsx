import React, { useState, useEffect } from 'react';
import '../../css/BusModal.css';

function DriverModal({ isOpen, onClose, driver, onSubmit, title }) {
  const [formData, setFormData] = useState({
    phone: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (isOpen && driver) {
      setFormData({
        phone: driver.phone || '',
        is_active: driver.is_active === 1 || driver.is_active === true
      });
      setError('');
      setPhoneError('');
    }
  }, [isOpen, driver]);

  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\d\s\+\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (value && !validatePhone(value)) {
        setPhoneError('Please enter a valid phone number');
      } else {
        setPhoneError('');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (phoneError) {
      setError('Please fix validation errors');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await onSubmit(formData);
      
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to update driver');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bus-modal-overlay" onClick={onClose}>
      <div className="bus-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bus-modal-header">
          <h2>{title || 'Edit Driver'}</h2>
          <button className="bus-modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="bus-modal-body">
            {error && <div className="bus-modal-error">{error}</div>}
            
            <div className="bus-form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={driver?.full_name || ''} 
                disabled 
                className="bus-form-disabled" 
              />
            </div>
            
            <div className="bus-form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={driver?.email || ''} 
                disabled 
                className="bus-form-disabled" 
              />
            </div>
            
            <div className="bus-form-group">
              <label>Phone Number (Optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g., 09123456789"
                disabled={loading}
                className={phoneError ? 'bus-form-error-input' : ''}
              />
              {phoneError && <small className="bus-form-error">{phoneError}</small>}
            </div>
            
            <div className="bus-form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Active Status</span>
              </label>
              <small className="bus-form-hint">
                {formData.is_active ? 'Driver can be assigned to buses' : 'Driver cannot be assigned to buses'}
              </small>
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
              disabled={loading || !!phoneError}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DriverModal;