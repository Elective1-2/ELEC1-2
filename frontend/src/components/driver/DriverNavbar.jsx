import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const DriverNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'DR';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="dm-nav">
      <div className="dm-nav-logo">
        <span className="dm-logo-seg m">M</span>
        <span className="dm-logo-seg two">2</span>
        <span className="dm-logo-seg b">B</span>
      </div>

      <div className="dm-nav-right">
        <div className="dm-nav-user">
          <div className="dm-nav-user-info">
            <span className="dm-nav-username">{user?.full_name || 'Driver'}</span>
            <span className="dm-nav-role">Driver</span>
          </div>
          <div className="dm-nav-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>

        {/* <div className="dm-nav-divider"></div> */}

      </div>
    </nav>
  );
};

export default DriverNavbar;