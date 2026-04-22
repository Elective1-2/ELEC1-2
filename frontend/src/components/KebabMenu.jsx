import React, { useState, useRef, useEffect } from 'react';
import '../css/KebabMenu.css';

function KebabMenu({ onEdit, onAssign, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="kebab-menu" ref={menuRef}>
      <button className="kebab-btn" onClick={() => setIsOpen(!isOpen)}>⋮</button>
      {isOpen && (
        <div className="kebab-dropdown">
          <button className="kebab-item edit" onClick={() => { setIsOpen(false); onEdit(); }}> Edit</button>
          <button className="kebab-item assign" onClick={() => { setIsOpen(false); onAssign(); }}> Assign</button>
          <button className="kebab-item delete" onClick={() => { setIsOpen(false); onDelete(); }}> Delete</button>
        </div>
      )}
    </div>
  );
}

export default KebabMenu;