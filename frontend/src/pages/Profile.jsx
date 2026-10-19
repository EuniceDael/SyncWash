import { useState } from 'react';
import { DB } from '../db';
import { useApp } from '../AppContext';
import { Badge } from '../components/UI';

export default function Profile() {
  const { currentUser, setCurrentUser, toast } = useApp();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [pass, setPass] = useState('');
  const [smsAlerts, setSmsAlerts] = useState(true);

  const isStaff = currentUser.role === 'staff';
  const isCustomer = currentUser.role === 'customer';

  // Stats for staff or customer
  const orders = DB.get('orders');
  const userOrdersCount = isCustomer
    ? orders.filter(o => o.customerId === currentUser.id).length
    : orders.filter(o => o.staffId === currentUser.id).length;

  function handleSave() {
    if (!name || !email) {
      toast('warning', 'Incomplete', 'Name and email are required.');
      return;
    }
    const users = DB.get('users');
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], name, email, phone };
      if (pass) users[idx].password = pass;
      DB.set('users', users);
      setCurrentUser(users[idx]);
      toast('success', 'Profile Updated', 'Your details have been saved.');
    }
  }

  return (
    <div className="page active mobile-profile-page" id="page-profile">
      {/* Profile Header Avatar */}
      <div className="profile-hero-card">
        <div className="profile-avatar-circle">
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="profile-name-text">{currentUser.name}</h2>
        <div className="profile-role-badge">
          <Badge status={currentUser.role} />
        </div>
        <div className="profile-tagline">
          {isStaff ? '🧑‍💼 Active Store Operations Staff' : '🙋 Registered Laundry Customer'}
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="profile-stats-row mb-20">
        <div className="profile-stat-box">
          <span className="stat-num">{userOrdersCount}</span>
          <span className="stat-title">{isStaff ? 'Handled Orders' : 'Total Bookings'}</span>
        </div>
        <div className="profile-stat-box">
          <span className="stat-num">{isStaff ? '🟢 Shift Active' : '⭐ Active Member'}</span>
          <span className="stat-title">Status</span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card mb-20">
        <div className="card-header">
          <div className="card-title">📱 Account Details</div>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="text-xs text-muted mb-4">Full Name</label>
            <input className="form-control" type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="text-xs text-muted mb-4">Email Address</label>
            <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="text-xs text-muted mb-4">
              Phone Number {isCustomer && <span className="text-cyan font-mono">(receives pickup SMS)</span>}
            </label>
            <input className="form-control" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="text-xs text-muted mb-4">Update Password (optional)</label>
            <input
              className="form-control"
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="Leave blank to keep current"
            />
          </div>

          {/* SMS Notification Toggle */}
          <div className="settings-toggle-row">
            <div>
              <div className="toggle-title">SMS Notifications</div>
              <div className="toggle-sub">Receive instant SMS alerts when laundry changes status</div>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={e => setSmsAlerts(e.target.checked)}
              className="android-switch"
            />
          </div>

          <button className="btn btn-primary w-full mt-16" onClick={handleSave}>
            💾 Save Profile Details
          </button>
        </div>
      </div>

      {/* Support / Branch Info */}
      <div className="card mb-20">
        <div className="card-body">
          <div className="fw-600 mb-8 text-cyan">🏪 SmartLaundry Branch Information</div>
          <div className="text-sm text-secondary mb-4">📍 101 Laundry Blvd, Metro Manila</div>
          <div className="text-sm text-secondary mb-4">⏰ Store Hours: Mon–Sun 8:00 AM – 8:00 PM</div>
          <div className="text-sm text-secondary">📞 Hotline: 0917-123-4567</div>
        </div>
      </div>

      {/* Sign Out Action */}
      <button
        className="btn btn-danger w-full mb-30"
        style={{ padding: '14px', borderRadius: '14px', fontSize: '15px' }}
        onClick={() => setCurrentUser(null)}
      >
        🚪 Sign Out of Account
      </button>
    </div>
  );
}
