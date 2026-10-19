import { useApp } from '../AppContext';
import { DB } from '../db';

export default function AndroidBottomNav({ currentPage, onNavigate, smsBadge }) {
  const { currentUser } = useApp();

  // Calculate order badge for staff
  let orderBadge = 0;
  if (currentUser?.role === 'staff') {
    const orders = DB.get('orders');
    orderBadge = orders.filter(o => o.status === 'pending' || o.status === 'ready').length;
  } else if (currentUser?.role === 'customer') {
    const orders = DB.get('orders');
    orderBadge = orders.filter(o => o.customerId === currentUser.id && o.status !== 'completed' && o.status !== 'cancelled').length;
  }

  const staffTabs = [
    { id: 'orders',   icon: '🧺', label: 'Orders', badge: orderBadge },
    { id: 'neworder', icon: '➕', label: 'Walk-In', isAction: true },
    { id: 'sms',      icon: '📱', label: 'SMS', badge: smsBadge },
    { id: 'services', icon: '🏷️', label: 'Prices' },
    { id: 'profile',  icon: '👤', label: 'Shift' }
  ];

  const customerTabs = [
    { id: 'track',    icon: '🔍', label: 'Track' },
    { id: 'neworder', icon: '🧺', label: 'Book', isAction: true },
    { id: 'myorders', icon: '📋', label: 'My Orders', badge: orderBadge },
    { id: 'services', icon: '🏷️', label: 'Rates' },
    { id: 'profile',  icon: '👤', label: 'Profile' }
  ];

  const tabs = currentUser?.role === 'customer' ? customerTabs : staffTabs;

  return (
    <nav className="android-bottom-nav" aria-label="Mobile Navigation">
      <div className="bottom-nav-tabs">
        {tabs.map(tab => {
          const isActive = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              className={`bottom-nav-item ${isActive ? 'active' : ''} ${tab.isAction ? 'is-action' : ''}`}
              onClick={() => onNavigate(tab.id)}
              aria-label={tab.label}
              type="button"
            >
              <div className="bottom-nav-icon-container">
                <span className="bottom-nav-pill" />
                <span className="bottom-nav-icon">{tab.icon}</span>
                {tab.badge > 0 && (
                  <span className="bottom-nav-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>
                )}
              </div>
              <span className="bottom-nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
      {/* Android gesture navigation handle */}
      <div className="android-gesture-handle" />
    </nav>
  );
}
