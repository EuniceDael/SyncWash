import { useState, useEffect } from 'react';
import { useApp } from '../AppContext';

const NAV_CONFIG = {
  admin: [
    { section: 'Main' },
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'orders',    icon: '🧺', label: 'Orders' },
    { section: 'Management' },
    { id: 'users',    icon: '👥', label: 'User Management' },
    { id: 'services', icon: '⚙️', label: 'Services & Pricing' },
    { id: 'sms',      icon: '📱', label: 'SMS Notifications', badge: true },
    { section: 'Analytics' },
    { id: 'reports',  icon: '📈', label: 'Reports & Analytics' },
    { id: 'system',   icon: '🔧', label: 'System Config' },
    { section: 'Documentation' },
    { id: 'about',    icon: '🗺️', label: 'System Overview' }
  ],
  owner: [
    { section: 'Main' },
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'orders',    icon: '🧺', label: 'Order Management' },
    { section: 'Analytics' },
    { id: 'reports', icon: '📈', label: 'Reports & Analytics' },
    { id: 'users',   icon: '👥', label: 'Staff & Customers' },
    { id: 'sms',     icon: '📱', label: 'SMS Log', badge: true },
    { section: 'Documentation' },
    { id: 'about', icon: '🗺️', label: 'System Overview' }
  ],
  staff: [
    { section: 'Operations' },
    { id: 'orders', icon: '🧺', label: 'Order Management' },
    { id: 'sms',    icon: '📱', label: 'SMS Notifications', badge: true },
    { section: 'Reference' },
    { id: 'services', icon: '⚙️', label: 'Price List' }
  ],
  customer: [
    { section: 'My Laundry' },
    { id: 'neworder',  icon: '➕', label: 'New Order' },
    { id: 'track',    icon: '🔍', label: 'Track Order' },
    { id: 'myorders', icon: '📋', label: 'My Orders' },
    { id: 'profile',  icon: '👤', label: 'My Profile' }
  ]
};

export default function Sidebar({ currentPage, onNavigate, smsBadge }) {
  const { currentUser, setCurrentUser } = useApp();
  const items = NAV_CONFIG[currentUser.role] || [];

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">🧺</div>
        <div>
          <div className="brand-name">SmartLaundry</div>
          <div className="brand-sub">Management System</div>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar" id="sidebarAvatar">{currentUser.name.charAt(0).toUpperCase()}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name" id="sidebarUserName">{currentUser.name}</div>
          <div className="sidebar-user-role" id="sidebarUserRole">{currentUser.role}</div>
        </div>
      </div>

      <nav className="sidebar-nav" id="sidebarNav">
        {items.map((item, idx) =>
          item.section ? (
            <div key={idx} className="nav-section-title">{item.section}</div>
          ) : (
            <div
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item${currentPage === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && smsBadge > 0 && <span className="nav-badge" id="badge-sms">{smsBadge}</span>}
            </div>
          )
        )}
      </nav>

      <button className="btn btn-danger" id="logoutBtn" style={{margin:'16px',width:'calc(100% - 32px)'}}
        onClick={() => setCurrentUser(null)}>
        🚪 Sign Out
      </button>
    </aside>
  );
}
