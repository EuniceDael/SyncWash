import { useState } from 'react';
import { useApp } from '../AppContext';

const PAGE_NAMES = {
  orders: 'Orders Queue',
  neworder: 'New Order',
  track: 'Track Laundry',
  myorders: 'My Orders',
  services: 'Price Catalog',
  sms: 'SMS Logs',
  profile: 'My Account',
  dashboard: 'Dashboard'
};

export default function AndroidTopBar({ currentPage, onNavigate, smsBadge }) {
  const { currentUser, setCurrentUser } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const isStaff = currentUser.role === 'staff';
  const isCustomer = currentUser.role === 'customer';
  const pageTitle = PAGE_NAMES[currentPage] || 'SmartLaundry';

  return (
    <header className="android-top-bar">
      <div className="android-top-bar-left">
        <div className="android-brand-icon" onClick={() => onNavigate(isCustomer ? 'track' : 'orders')}>
          🧺
        </div>
        <div className="android-brand-meta">
          <div className="android-brand-title">SmartLaundry</div>
          <div className="android-page-indicator">{pageTitle}</div>
        </div>
      </div>

      <div className="android-top-bar-right">
        {/* Role Tag */}
        <span className={`android-role-tag ${currentUser.role}`}>
          {isStaff ? '🧑‍💼 Staff' : isCustomer ? '🙋 Customer' : currentUser.role}
        </span>

        {/* SMS / Notifications Bell */}
        <button
          className="android-icon-btn"
          aria-label="Notifications"
          onClick={() => {
            if (isStaff) onNavigate('sms');
            else onNavigate('myorders');
          }}
        >
          <span>🔔</span>
          {smsBadge > 0 && <span className="android-badge-dot">{smsBadge}</span>}
        </button>

        {/* User Avatar Menu Trigger */}
        <div className="android-user-menu-wrap">
          <button
            className="android-avatar-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="User profile menu"
          >
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </button>

          {menuOpen && (
            <div className="android-user-popover">
              <div className="popover-header">
                <div className="popover-avatar">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="popover-details">
                  <div className="popover-name">{currentUser.name}</div>
                  <div className="popover-email">{currentUser.email}</div>
                  <span className={`badge badge-${currentUser.role}`}>{currentUser.role}</span>
                </div>
              </div>

              <div className="popover-divider" />

              <button
                className="popover-item"
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate('profile');
                }}
              >
                <span>👤 Profile & Settings</span>
              </button>

              <button
                className="popover-item text-danger"
                onClick={() => {
                  setMenuOpen(false);
                  setCurrentUser(null);
                }}
              >
                <span>🚪 Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
