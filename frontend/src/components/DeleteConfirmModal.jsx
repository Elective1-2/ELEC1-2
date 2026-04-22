import React from 'react';
import '../css/DeleteConfirmModal.css';

function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message, itemName, loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <h2>{title || 'Confirm Delete'}</h2>
          <button className="delete-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="delete-modal-body">
          <div className="delete-modal-icon">🗑️</div>
          <p className="delete-modal-message">{message || 'Are you sure you want to delete this item?'}</p>
          {itemName && <p className="delete-modal-item"><strong>"{itemName}"</strong></p>}
          <p className="delete-modal-warning">This action cannot be undone.</p>
        </div>
        
        <div className="delete-modal-footer">
          <button type="button" className="delete-modal-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="delete-modal-confirm" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;