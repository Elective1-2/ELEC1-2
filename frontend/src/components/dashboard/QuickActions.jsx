import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, EditIcon } from './DashboardIcons';
import BusNumberModal from '../BusNumberModal';
import '../../css/dashboard.css';

function QuickActions() {
  const navigate = useNavigate();
  const [showBusModal, setShowBusModal] = useState(false);

  const handleFindBus = (busNumber) => {
    sessionStorage.setItem('trackingBusNumber', busNumber);
    const passengerUrl = '/passenger';
    window.open(passengerUrl, '_blank');
    return true;
  };

  const actions = [
    {
      label: 'Find Bus',
      description: 'Track a specific bus',
      icon: <SearchIcon />,
      color: 'ic-blue',
      onClick: () => setShowBusModal(true)
    },
    {
      label: 'Manage Fleet',
      description: 'Manage buses & drivers',
      icon: <EditIcon />,
      color: 'ic-green',
      onClick: () => navigate('/management')
    }
  ];

  return (
    <>
      <div className="m2b-quick-actions">
        <h3 className="m2b-section-title">Quick Actions</h3>
        <div className="m2b-quick-actions-grid">
          {actions.map((action, index) => (
            <div 
              key={index} 
              className="m2b-quick-action-card"
              onClick={action.onClick}
            >
              <div className={`m2b-quick-action-icon ${action.color}`}>
                {action.icon}
              </div>
              <div className="m2b-quick-action-content">
                <div className="m2b-quick-action-label">{action.label}</div>
                <div className="m2b-quick-action-desc">{action.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BusNumberModal
        isOpen={showBusModal}
        onClose={() => setShowBusModal(false)}
        onSubmit={handleFindBus}
      />
    </>
  );
}

export default QuickActions;