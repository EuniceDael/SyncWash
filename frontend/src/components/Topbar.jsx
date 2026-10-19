import { useApp } from '../AppContext';

const PAGE_TITLES = {
  dashboard: ['📊 Dashboard', 'Overview & Analytics'],
  orders:    ['🧺 Order Management', 'Manage laundry orders'],
  users:     ['👥 User Management', 'Manage accounts'],
  services:  ['⚙️ Services & Pricing', 'Service catalog'],
  sms:       ['📱 SMS Notifications', 'Message log'],
  reports:   ['📈 Reports & Analytics', 'Business insights'],
  system:    ['🔧 System Configuration', 'Settings'],
  track:     ['🔍 Track Order', 'Check your order status'],
  myorders:  ['📋 My Orders', 'Your order history'],
  profile:   ['👤 My Profile', 'Account settings'],
  about:     ['🗺️ System Overview', 'Architecture, technologies & workflow']
};

export default function Topbar({ currentPage }) {
  const { toggleCpMode, currentUser } = useApp();
  const [title, subtitle] = PAGE_TITLES[currentPage] || ['SmartLaundry', ''];

  const isStaffOrCust = currentUser?.role === 'staff' || currentUser?.role === 'customer';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-title" id="topbarTitle">{title}</div>
        <div className="topbar-subtitle" id="topbarSubtitle">{subtitle}</div>
      </div>
      <div className="topbar-right">
        {/* Toggle to preview Cellphone (CP) View while on desktop */}
        {isStaffOrCust && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={toggleCpMode}
            title="Preview Cellphone (CP) view on desktop"
            style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>📱</span>
            <span>Switch to CP View</span>
          </button>
        )}
        <div className="topbar-notif" id="topbarNotif">🔔</div>
      </div>
    </header>
  );
}
