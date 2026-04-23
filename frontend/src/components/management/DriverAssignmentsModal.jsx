import React, { useState, useEffect } from 'react';
import '../../css/BusModal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function DriverAssignmentsModal({ isOpen, onClose, driver, buses, routes, onUpdate }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({ bus_id: '', route_id: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && driver) {
      setAssignments(driver.assignments || []);
      setShowAddForm(false);
      setEditingAssignment(null);
      setError('');
    }
  }, [isOpen, driver]);

  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingAssignment(null);
    setFormData({ bus_id: '', route_id: '' });
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setShowAddForm(false);
    setFormData({
      bus_id: assignment.bus_id,
      route_id: assignment.route_id
    });
  };

  const handleCancelEdit = () => {
    setEditingAssignment(null);
    setFormData({ bus_id: '', route_id: '' });
  };

  const handleDelete = async (assignment) => {
    if (!window.confirm(`Remove assignment for Bus ${assignment.bus_number} on route ${assignment.route_name}?`)) {
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
      
      // Update local state
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
    
    if (!formData.bus_id || !formData.route_id) {
      setError('Please select both bus and route');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (editingAssignment) {
        // Update existing assignment
        response = await fetch(`${API_URL}/admin/assignments/${editingAssignment.assignment_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Add new assignment
        response = await fetch(`${API_URL}/admin/drivers/${driver.user_id}/assignments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save assignment');
      }
      
      // Refresh data
      onUpdate?.();
      
      // Close form and reset
      setShowAddForm(false);
      setEditingAssignment(null);
      setFormData({ bus_id: '', route_id: '' });
      
      // Note: The parent component will refetch data and update the driver prop
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const activeBuses = buses.filter(b => b.status === 'active');
  const availableBuses = activeBuses.filter(bus => {
    // For editing, include the current bus
    if (editingAssignment && bus.bus_id === editingAssignment.bus_id) {
      return true;
    }
    // Check if bus is already assigned to this driver
    return !assignments.some(a => a.bus_id === bus.bus_id);
  });

  return (
    <div className="bus-modal-overlay" onClick={onClose}>
      <div className="bus-modal bus-modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="bus-modal-header">
          <h2>Manage Assignments: {driver?.full_name}</h2>
          <button className="bus-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="bus-modal-body">
          {error && <div className="bus-modal-error">{error}</div>}
          
          {/* Current Assignments List */}
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
                      <div className="assignment-bus">
                        <strong>Bus {assignment.bus_number}</strong>
                        {assignment.plate_number && <span> ({assignment.plate_number})</span>}
                      </div>
                      <div className="assignment-route">
                        Route: {assignment.route_name}
                      </div>
                      <div className="assignment-date">
                        Assigned: {new Date(assignment.assigned_date).toLocaleDateString()}
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
          
          {/* Add/Edit Form */}
          {(showAddForm || editingAssignment) && (
            <div className="assignment-form-section">
              <h3>{editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="bus-form-group">
                  <label>Select Bus <span className="required">*</span></label>
                  <select 
                    value={formData.bus_id} 
                    onChange={(e) => setFormData(prev => ({ ...prev, bus_id: e.target.value }))} 
                    required
                    disabled={submitting}
                  >
                    <option value="">-- Select Bus --</option>
                    {availableBuses.map(bus => (
                      <option key={bus.bus_id} value={bus.bus_id}>
                        {bus.bus_number} - {bus.plate_number || 'No plate'} ({bus.capacity} seats)
                      </option>
                    ))}
                  </select>
                  {availableBuses.length === 0 && (
                    <small className="bus-form-hint">No available buses</small>
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
                    disabled={submitting || availableBuses.length === 0}
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

export default DriverAssignmentsModal;