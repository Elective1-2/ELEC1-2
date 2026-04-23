import React, { useState, useEffect } from 'react';
import '../../css/BusModal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function BusAssignmentsModal({ isOpen, onClose, bus, drivers, routes, onUpdate }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({ driver_id: '', route_id: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && bus) {
      setAssignments(bus.assignments || []);
      setShowAddForm(false);
      setEditingAssignment(null);
      setError('');
    }
  }, [isOpen, bus]);

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingAssignment(null);
    setFormData({ driver_id: '', route_id: '' });
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setShowAddForm(false);
    setFormData({
      driver_id: assignment.driver_id,
      route_id: assignment.route_id
    });
  };

  const handleCancelEdit = () => {
    setEditingAssignment(null);
    setFormData({ driver_id: '', route_id: '' });
  };

  const handleDelete = async (assignment) => {
    if (!window.confirm(`Remove assignment for ${assignment.driver_name} on route ${assignment.route_name}?`)) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/assignments/${assignment.assignment_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete assignment');
      }
      
      setAssignments(prev => prev.filter(a => a.assignment_id !== assignment.assignment_id));
      onUpdate?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.driver_id || !formData.route_id) {
      setError('Please select both driver and route');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (editingAssignment) {
        response = await fetch(`${API_URL}/admin/assignments/${editingAssignment.assignment_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            bus_id: formData.bus_id,
            route_id: formData.route_id
          })
        });
      } else {
        response = await fetch(`${API_URL}/admin/buses/${bus.bus_id}/assignments`, {
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
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save assignment');
      }
      
      onUpdate?.();
      setShowAddForm(false);
      setEditingAssignment(null);
      setFormData({ driver_id: '', route_id: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const activeDrivers = drivers.filter(d => d.is_active === 1);
  
  const availableDrivers = activeDrivers.filter(driver => {
    if (editingAssignment && driver.user_id === editingAssignment.driver_id) {
      return true;
    }
    return !assignments.some(a => a.driver_id === driver.user_id);
  });

  return (
    <div className="bus-modal-overlay" onClick={onClose}>
      <div className="bus-modal bus-modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="bus-modal-header">
          <h2>Manage Assignments: Bus {bus?.bus_number}</h2>
          <button className="bus-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="bus-modal-body">
          {error && <div className="bus-modal-error">{error}</div>}
          
          <div className="assignments-section">
            <div className="assignments-header">
              <h3>Current Assignments</h3>
              {!showAddForm && !editingAssignment && (
                <button 
                  className="mgmt-add-btn mgmt-add-btn-small" 
                  onClick={handleAddNew}
                  disabled={loading}
                >
                  + Add Assignment
                </button>
              )}
            </div>
            
            {assignments.length === 0 ? (
              <p className="no-assignments-message">No active assignments</p>
            ) : (
              <div className="assignments-list">
                {assignments.map(assignment => (
                  <div key={assignment.assignment_id} className="assignment-card">
                    <div className="assignment-info">
                      <div className="assignment-driver">
                        <strong>{assignment.driver_name}</strong>
                        {assignment.driver_email && <span> ({assignment.driver_email})</span>}
                      </div>
                      <div className="assignment-route">
                        Route: {assignment.route_name}
                      </div>
                      {assignment.start_location && assignment.end_location && (
                        <div className="assignment-route-details">
                          {assignment.start_location} → {assignment.end_location}
                        </div>
                      )}
                      <div className="assignment-date">
                        Assigned: {assignment.assigned_date ? new Date(assignment.assigned_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div className="assignment-actions">
                      <button 
                        className="assignment-edit-btn"
                        onClick={() => handleEdit(assignment)}
                        disabled={loading || showAddForm || editingAssignment}
                      >
                        Edit
                      </button>
                      <button 
                        className="assignment-delete-btn"
                        onClick={() => handleDelete(assignment)}
                        disabled={loading || showAddForm || editingAssignment}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {(showAddForm || editingAssignment) && (
            <div className="assignment-form-section">
              <h3>{editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="bus-form-group">
                  <label>Select Driver <span className="required">*</span></label>
                  <select 
                    value={formData.driver_id} 
                    onChange={(e) => setFormData(prev => ({ ...prev, driver_id: e.target.value }))} 
                    required
                    disabled={submitting}
                  >
                    <option value="">-- Select Driver --</option>
                    {availableDrivers.map(driver => (
                      <option key={driver.user_id} value={driver.user_id}>
                        {driver.full_name} ({driver.email})
                      </option>
                    ))}
                  </select>
                  {availableDrivers.length === 0 && (
                    <small className="bus-form-hint">No available drivers</small>
                  )}
                </div>
                
                <div className="bus-form-group">
                  <label>Select Route <span className="required">*</span></label>
                  <select 
                    value={formData.route_id} 
                    onChange={(e) => setFormData(prev => ({ ...prev, route_id: e.target.value }))} 
                    required
                    disabled={submitting}
                  >
                    <option value="">-- Select Route --</option>
                    {routes.map(route => (
                      <option key={route.route_id} value={route.route_id}>
                        {route.name} ({route.start_location} → {route.end_location})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="bus-modal-cancel"
                    onClick={editingAssignment ? handleCancelEdit : () => setShowAddForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bus-modal-submit"
                    disabled={submitting || availableDrivers.length === 0}
                  >
                    {submitting ? 'Saving...' : (editingAssignment ? 'Update Assignment' : 'Add Assignment')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        <div className="bus-modal-footer">
          <button className="bus-modal-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default BusAssignmentsModal;