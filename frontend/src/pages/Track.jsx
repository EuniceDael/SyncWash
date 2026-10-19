import { useState, useEffect } from 'react';
import { DB, fmt, fmtDate } from '../db';
import { useApp } from '../AppContext';
import { Badge, OrderProgress } from '../components/UI';

function PickupBarcode({ orderId }) {
  return (
    <div className="pickup-barcode-container">
      <div className="barcode-bars">
        {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2].map((w, idx) => (
          <span
            key={idx}
            className="barcode-bar"
            style={{
              width: `${w * 2}px`,
              marginRight: `${(idx % 3) + 1}px`
            }}
          />
        ))}
      </div>
      <div className="barcode-number">{orderId}</div>
      <div className="barcode-instruction">Present this barcode to counter staff</div>
    </div>
  );
}

function MobileOrderProgressTimeline({ status }) {
  const steps = [
    { key: 'pending', title: 'Order Received', desc: 'Tagged & sorted at counter', icon: '📥' },
    { key: 'washing', title: 'Washing Cycle', desc: 'Deep cleaning with premium soap', icon: '🫧' },
    { key: 'drying',  title: 'Drying & Conditioning', desc: 'Gentle heat & fabric softness', icon: '💨' },
    { key: 'folding', title: 'Folding & Packaging', desc: 'Neatly packed and quality checked', icon: '👕' },
    { key: 'ready',   title: 'Ready for Pickup', desc: 'Waiting for you at branch', icon: '📦' },
    { key: 'completed', title: 'Order Completed', desc: 'Handed over to customer', icon: '🏠' }
  ];

  const all = ['pending', 'washing', 'drying', 'folding', 'ready', 'completed'];
  const curIdx = all.indexOf(status);

  return (
    <div className="android-timeline-stepper">
      {steps.map((s, idx) => {
        let state = 'future';
        if (status === 'cancelled') state = 'cancelled';
        else if (idx < curIdx) state = 'done';
        else if (idx === curIdx) state = 'active';

        return (
          <div key={s.key} className={`timeline-item ${state}`}>
            <div className="timeline-indicator-col">
              <div className="timeline-node">
                {state === 'done' ? '✓' : s.icon}
              </div>
              {idx < steps.length - 1 && <div className="timeline-line" />}
            </div>
            <div className="timeline-content-col">
              <div className="timeline-step-title">
                {s.title}
                {state === 'active' && <span className="timeline-live-pill">LIVE NOW</span>}
              </div>
              <div className="timeline-step-desc">{s.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DesktopTrackResult({ order }) {
  if (!order) return null;
  return (
    <div className="card mb-24">
      <div className="card-header">
        <div className="card-title">Order {order.id}</div>
        <Badge status={order.status} />
      </div>
      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div><div className="text-xs text-muted mb-4">Service</div><div className="fw-600">{order.serviceName}</div></div>
          <div><div className="text-xs text-muted mb-4">Amount</div><div className="text-warning fw-600">{fmt(order.amount)}</div></div>
          <div><div className="text-xs text-muted mb-4">Date In</div><div>{fmtDate(order.dateIn)}</div></div>
        </div>
        <OrderProgress status={order.status} />
        {order.status === 'ready' && (
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '10px', color: 'var(--success)', fontWeight: 600, marginTop: '8px' }}>
            🎉 Your laundry is ready for pickup!
          </div>
        )}
        {order.status === 'cancelled' && (
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,71,87,0.1)', borderRadius: '10px', color: 'var(--danger)', marginTop: '8px' }}>
            ⚠️ This order has been cancelled.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Track({ initOrderId }) {
  const { currentUser, isCpMode } = useApp();
  const [input, setInput] = useState(initOrderId || '');
  const [found, setFound] = useState(undefined); // for desktop
  const [selectedOrder, setSelectedOrder] = useState(null); // for mobile

  const myOrders = DB.get('orders')
    .filter(o => o.customerId === currentUser?.id)
    .sort((a, b) => new Date(b.created) - new Date(a.created));

  useEffect(() => {
    if (initOrderId) {
      const ord = DB.get('orders').find(o => o.id === initOrderId);
      if (ord) {
        setSelectedOrder(ord);
        setFound(ord);
        setInput(initOrderId);
      }
    } else if (myOrders.length > 0) {
      const active = myOrders.find(o => o.status !== 'completed' && o.status !== 'cancelled') || myOrders[0];
      setSelectedOrder(active);
      setInput(active.id);
    }
  }, [initOrderId]);

  function doTrackDesktop(id) {
    const q = (id || input).trim().toUpperCase();
    if (!q) return;
    setInput(q);
    const order = DB.get('orders').find(o => o.id === q);
    setFound(order || null);
  }

  function handleSearchMobile(id) {
    const q = (id || input).trim().toUpperCase();
    if (!q) return;
    setInput(q);
    const ord = DB.get('orders').find(o => o.id === q);
    setSelectedOrder(ord || 'not_found');
  }

  /* ─────────────────────────────────────────────────────────────
     CELLPHONE ("CP") UI/UX FOR CUSTOMER
     ───────────────────────────────────────────────────────────── */
  if (isCpMode) {
    const order = selectedOrder && selectedOrder !== 'not_found' ? selectedOrder : null;

    return (
      <div className="page active mobile-track-page" id="page-track">
        {/* Customer Header Banner */}
        <div className="customer-welcome-card">
          <div className="welcome-text-meta">
            <span className="greeting-sub">SmartLaundry Tracking</span>
            <h2 className="greeting-name">Hi, {currentUser?.name?.split(' ')[0] || 'Customer'} 👋</h2>
          </div>
          <div className="welcome-icon">🧺</div>
        </div>

        {/* Quick Switcher for Customer's Active Orders */}
        {myOrders.length > 0 && (
          <div className="my-order-pills-row">
            <div className="pills-title">Your Orders:</div>
            <div className="pills-scroll">
              {myOrders.slice(0, 5).map(o => {
                const isSelected = order?.id === o.id;
                return (
                  <button
                    key={o.id}
                    className={`order-switch-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedOrder(o);
                      setInput(o.id);
                    }}
                  >
                    <span className="chip-id">{o.id}</span>
                    <span className={`chip-dot status-${o.status}`} />
                    <span className="chip-svc">{o.serviceName.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Input for Tracking */}
        <div className="mobile-search-bar mb-16">
          <div className="mobile-search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="mobile-search-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchMobile()}
              placeholder="Enter Order ID (e.g. ORD-1002)"
            />
            {input && (
              <button className="search-clear-btn" onClick={() => setInput('')}>✕</button>
            )}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => handleSearchMobile()}>
            Track
          </button>
        </div>

        {selectedOrder === 'not_found' && (
          <div className="card mb-16" style={{ borderColor: 'var(--danger)', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍❌</div>
            <div className="fw-600 text-danger mb-4">Order Not Found</div>
            <div className="text-sm text-muted">Please double check your Order ID and try again.</div>
          </div>
        )}

        {order && (
          <div className="active-tracker-card mb-20">
            <div className="tracker-header">
              <div>
                <span className="tracker-id-label">ORDER ID</span>
                <div className="tracker-id-value">{order.id}</div>
              </div>
              <Badge status={order.status} />
            </div>

            {order.status === 'ready' && (
              <div className="ready-celebration-box">
                <div className="ready-icon">🎉</div>
                <div className="ready-title">Your Laundry is Ready!</div>
                <div className="ready-desc">All clean, folded, and packed for pickup.</div>
                <PickupBarcode orderId={order.id} />
                <div className="store-location-card">
                  <div className="location-row">
                    <span className="loc-icon">📍</span>
                    <div className="loc-text">
                      <strong>SmartLaundry Main Hub</strong>
                      <div>101 Laundry St., Metro Branch</div>
                    </div>
                  </div>
                  <div className="location-row">
                    <span className="loc-icon">⏰</span>
                    <div className="loc-text">Open Daily: 8:00 AM – 8:00 PM</div>
                  </div>
                  <a href="tel:09171234567" className="btn btn-success btn-sm w-full mt-8">
                    📞 Tap to Call Branch
                  </a>
                </div>
              </div>
            )}

            <div className="tracker-meta-grid">
              <div className="meta-item">
                <div className="meta-label">Service</div>
                <div className="meta-val">{order.serviceName}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Weight / Qty</div>
                <div className="meta-val">{order.quantity} {order.unit}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Total Amount</div>
                <div className="meta-val text-warning fw-700">{fmt(order.amount)}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Drop-off Date</div>
                <div className="meta-val">{fmtDate(order.dateIn)}</div>
              </div>
            </div>

            <div className="tracker-timeline-section">
              <div className="timeline-header-title">Live Laundry Progress</div>
              <MobileOrderProgressTimeline status={order.status} />
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     ORIGINAL DESKTOP UI/UX FOR CUSTOMER & USERS
     ───────────────────────────────────────────────────────────── */
  return (
    <div className="page active" id="page-track">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="track-card">
          <h2 style={{ fontFamily: "'Orbitron',monospace", color: 'var(--accent-cyan)', marginBottom: '8px', fontSize: '18px' }}>
            🔍 TRACK YOUR ORDER
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Enter your Order ID to check current status
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              className="form-control"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doTrackDesktop()}
              placeholder="e.g. ORD-1001"
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={() => doTrackDesktop()}>Track</button>
          </div>
        </div>

        {found === null && (
          <div className="card mb-24" style={{ borderColor: 'var(--danger)' }}>
            <div className="card-body text-center" style={{ color: 'var(--danger)' }}>
              ❌ Order not found. Check the ID and try again.
            </div>
          </div>
        )}

        {found && <DesktopTrackResult order={found} />}

        <div>
          <div className="card-title" style={{ marginBottom: '16px' }}>📋 Your Recent Orders</div>
          {myOrders.length === 0 ? (
            <div className="card"><div className="card-body text-center text-muted">No orders yet.</div></div>
          ) : (
            myOrders.map(o => (
              <div key={o.id} className="card mb-16" style={{ cursor: 'pointer' }} onClick={() => doTrackDesktop(o.id)}>
                <div className="card-body" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="text-cyan font-mono" style={{ fontSize: '13px', marginBottom: '4px' }}>{o.id}</div>
                      <div className="fw-600">{o.serviceName}</div>
                      <div className="text-muted text-xs">{fmtDate(o.dateIn)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Badge status={o.status} />
                      <div className="text-warning fw-600 mt-4">{fmt(o.amount)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
