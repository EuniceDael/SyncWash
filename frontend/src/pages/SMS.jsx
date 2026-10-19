import { useState } from 'react';
import { DB, fmtDateTime } from '../db';
import { Badge, EmptyState } from '../components/UI';

export default function SMS() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const all    = DB.get('smsLogs');
  const sent   = all.filter(l => l.status === 'sent').length;
  const failed = all.filter(l => l.status === 'failed').length;
  const total  = all.length;

  let logs = [...all];
  if (filter !== 'all') logs = logs.filter(l => l.status === filter);
  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(l => l.phone.includes(q) || l.customerName.toLowerCase().includes(q));
  }
  logs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="page active mobile-sms-page" id="page-sms">
      {/* Mobile Header */}
      <div className="mobile-section-header">
        <div>
          <h2 className="mobile-page-heading">SMS Dispatch Log</h2>
          <p className="mobile-page-sub">Customer ready & pickup notifications</p>
        </div>
      </div>

      {/* Mini Stat Cards */}
      <div className="profile-stats-row mb-16">
        <div className="profile-stat-box">
          <span className="stat-num text-success">✅ {sent}</span>
          <span className="stat-title">Delivered SMS</span>
        </div>
        <div className="profile-stat-box">
          <span className="stat-num text-cyan">{total > 0 ? ((sent / total) * 100).toFixed(0) : 0}%</span>
          <span className="stat-title">Delivery Rate</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="mobile-search-bar mb-12">
        <div className="mobile-search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="mobile-search-input"
            placeholder="Search phone or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear-btn" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        <select
          className="filter-select"
          style={{ width: 'auto', padding: '8px 12px', borderRadius: '12px', fontSize: '12px' }}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Logs List */}
      <div className="mobile-cards-list">
        {logs.length === 0 ? (
          <div className="card">
            <EmptyState icon="📭" text="No SMS records found" />
          </div>
        ) : (
          logs.map(l => (
            <div key={l.id} className="android-order-card" style={{ gap: '6px' }}>
              <div className="card-top-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`sms-icon${l.status === 'failed' ? ' failed' : ''}`} style={{ fontSize: '14px' }}>
                    {l.status === 'sent' ? '✅' : '❌'}
                  </span>
                  <span className="fw-700" style={{ fontSize: '13px' }}>{l.customerName}</span>
                </div>
                <Badge status={l.status} />
              </div>

              <div style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>
                📱 <a href={`tel:${l.phone}`} className="phone-tap-link">{l.phone}</a>
              </div>

              <div className="sms-msg" style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.4
              }}>
                "{l.message}"
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>Order: <strong className="text-cyan font-mono">{l.orderId}</strong></span>
                <span>{fmtDateTime(l.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
