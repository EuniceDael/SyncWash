import { useState, useRef, useEffect } from 'react';
import { DB, fmt, fmtDate, genId } from '../db';
import { useApp } from '../AppContext';
import { Badge, Modal, OrderProgress, EmptyState } from '../components/UI';
import AndroidBottomSheet from '../components/AndroidBottomSheet';
import FloatingActionButton from '../components/FloatingActionButton';

function sendSMSAction(orderId, toast, onRefresh) {
  const orders = DB.get('orders');
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx < 0) return;
  const order = orders[idx];
  if (!order.customerPhone) {
    toast('warning', 'No Phone', 'This customer does not have a phone number on record.');
    return;
  }
  const status = Math.random() > 0.05 ? 'sent' : 'failed';
  const smsLogs = DB.get('smsLogs');
  smsLogs.push({
    id: genId('SMS'),
    orderId,
    phone: order.customerPhone,
    customerName: order.customerName,
    type: 'ready',
    message: `Hi ${order.customerName}, your laundry order ${order.id} is ready for pickup! Thank you for choosing SmartLaundry. 📱`,
    status,
    timestamp: new Date().toISOString()
  });
  DB.set('smsLogs', smsLogs);
  orders[idx].smsNotified = true;
  DB.set('orders', orders);
  toast(
    status === 'sent' ? 'success' : 'error',
    status === 'sent' ? 'SMS Sent! 📱' : 'SMS Failed',
    `${order.customerName} (${order.customerPhone})`
  );
  onRefresh();
}

function advanceOrderStatus(orderId, nextStatus, toast, onRefresh) {
  const orders = DB.get('orders');
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx < 0) return;
  orders[idx].status = nextStatus;
  if (nextStatus === 'completed') {
    orders[idx].dateOut = new Date().toISOString().split('T')[0];
  }
  DB.set('orders', orders);

  toast('success', `Status Updated: ${nextStatus.toUpperCase()}`, `Order ${orderId} moved to ${nextStatus}.`);

  if (nextStatus === 'ready' && !orders[idx].smsNotified && orders[idx].customerPhone) {
    sendSMSAction(orderId, toast, onRefresh);
  } else {
    onRefresh();
  }
}

export function getNextAction(status) {
  switch (status) {
    case 'pending':  return { label: '▶ Start Wash', confirmLabel: ' Tap to Confirm Wash', next: 'washing', color: 'btn-wash' };
    case 'washing':  return { label: '💨 To Dryer',  confirmLabel: ' Tap to Confirm Dryer', next: 'drying',  color: 'btn-dry'  };
    case 'drying':   return { label: '👕 Fold & Pack', confirmLabel: ' Tap to Confirm Fold', next: 'folding', color: 'btn-fold' };
    case 'folding':  return { label: '📱 Ready & SMS', confirmLabel: ' Tap to Confirm Ready', next: 'ready',   color: 'btn-ready' };
    case 'ready':    return { label: '✅ Handover',    confirmLabel: ' Tap to Complete', next: 'completed', color: 'btn-handover' };
    default: return null;
  }
}

/* ─── Order Modal (Adapts to Desktop Modal or Mobile Bottom Sheet) ─── */
function OrderModal({ orderId, onClose, onSaved, toast, isCpMode }) {
  const order = orderId ? DB.get('orders').find(o => o.id === orderId) : null;
  const services = DB.get('services');
  const customers = DB.get('users').filter(u => u.role === 'customer' && u.status === 'active');

  const isExistingWalkin = order?.customerId === 'walkin';

  const [custType, setCustType] = useState(isExistingWalkin ? 'walkin' : 'registered');
  const [custId, setCustId] = useState(isExistingWalkin ? '' : (order?.customerId || ''));
  const [walkinName, setWalkinName] = useState(isExistingWalkin ? (order?.customerName || '') : '');
  const [phone, setPhone] = useState(order?.customerPhone || '');
  const [serviceId, setSvcId] = useState(order?.serviceId || (services[0]?.id || ''));
  const [qty, setQty] = useState(order?.quantity || 3);
  const [amount, setAmount] = useState(order ? fmt(order.amount) : '₱0.00');
  const [status, setStatus] = useState(order?.status || 'pending');
  const [dateIn, setDateIn] = useState(order?.dateIn || new Date().toISOString().split('T')[0]);
  const [dateOut, setDateOut] = useState(order?.dateOut || '');
  const [notes, setNotes] = useState(order?.notes || '');
  const { currentUser } = useApp();

  const isWalkin = custType === 'walkin';

  function onCustTypeChange(type) {
    setCustType(type);
    setCustId('');
    setWalkinName('');
    setPhone('');
  }

  function onCustChange(id) {
    setCustId(id);
    const u = customers.find(c => c.id === id);
    setPhone(u?.phone || '');
  }

  function onSvcOrQtyChange(sId, q) {
    const svc = services.find(s => s.id === sId);
    if (svc && q) setAmount(fmt(svc.price * q));
  }

  function handleSave() {
    const svc = services.find(s => s.id === serviceId);
    if (!serviceId || !svc) { toast('warning', 'Incomplete', 'Please select a service.'); return; }

    let custData;
    if (isWalkin) {
      if (!walkinName.trim()) { toast('warning', 'Incomplete', 'Please enter walk-in customer name.'); return; }
      custData = { id: 'walkin', name: walkinName.trim(), phone: phone.trim() };
    } else {
      if (!custId) { toast('warning', 'Incomplete', 'Please select a registered customer.'); return; }
      const cust = DB.get('users').find(u => u.id === custId);
      custData = { id: cust.id, name: cust.name, phone: cust.phone };
    }

    const existing = orderId ? DB.get('orders').find(o => o.id === orderId) : null;
    const orderData = {
      id: orderId || genId('ORD'),
      customerId: custData.id,
      customerName: custData.name,
      customerPhone: custData.phone,
      serviceId: svc.id,
      serviceName: svc.name,
      servicePrice: svc.price,
      unit: svc.unit,
      quantity: parseFloat(qty),
      amount: +(svc.price * parseFloat(qty)).toFixed(2),
      status,
      dateIn,
      dateOut: dateOut || null,
      notes,
      staffId: currentUser.id,
      staffName: currentUser.name,
      smsNotified: existing?.smsNotified || false,
      created: existing?.created || new Date().toISOString(),
      walkin: isWalkin
    };

    const orders = DB.get('orders');
    if (orderId) {
      const i = orders.findIndex(o => o.id === orderId);
      if (i >= 0) orders[i] = orderData;
    } else {
      orders.push(orderData);
    }
    DB.set('orders', orders);
    toast('success', orderId ? 'Order Updated' : 'Order Created', `Order ${orderData.id} saved.`);
    if (orderData.status === 'ready' && !orderData.smsNotified && orderData.customerPhone) {
      sendSMSAction(orderData.id, toast, () => {});
    }
    onSaved();
    onClose();
  }

  const formFields = (
    <div className="form-row">
      <div className="form-group full">
        <label>Customer Type</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onCustTypeChange('registered')}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
              border: `2px solid ${!isWalkin ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
              background: !isWalkin ? 'rgba(0,212,255,0.12)' : 'var(--bg-input)',
              color: !isWalkin ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: !isWalkin ? 700 : 400, fontSize: '13px'
            }}
          >
            👤 Registered Customer
          </button>
          <button
            type="button"
            onClick={() => onCustTypeChange('walkin')}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
              border: `2px solid ${isWalkin ? 'var(--accent-yellow)' : 'var(--border-color)'}`,
              background: isWalkin ? 'rgba(255,179,0,0.12)' : 'var(--bg-input)',
              color: isWalkin ? 'var(--accent-yellow)' : 'var(--text-secondary)',
              fontWeight: isWalkin ? 700 : 400, fontSize: '13px'
            }}
          >
            🚶 Walk-in Customer
          </button>
        </div>
      </div>

      {!isWalkin ? (
        <>
          <div className="form-group full">
            <label>Customer</label>
            <select className="form-control" value={custId} onChange={e => onCustChange(e.target.value)} required>
              <option value="">— Select Customer —</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
            </select>
          </div>
          <div className="form-group full">
            <label>Phone</label>
            <input className="form-control" type="text" value={phone} readOnly placeholder="Auto-filled from customer" />
          </div>
        </>
      ) : (
        <>
          <div className="form-group full">
            <label>Walk-in Name <span style={{ color: 'var(--accent-yellow)', fontSize: '11px' }}>● Walk-in</span></label>
            <input
              className="form-control"
              type="text"
              value={walkinName}
              onChange={e => setWalkinName(e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
              required
            />
          </div>
          <div className="form-group full">
            <label>Phone <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>(optional)</span></label>
            <input
              className="form-control"
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 09171234567"
            />
          </div>
        </>
      )}

      <div className="form-group">
        <label>Service</label>
        <select className="form-control" value={serviceId} onChange={e => { setSvcId(e.target.value); onSvcOrQtyChange(e.target.value, qty); }} required>
          <option value="">— Select Service —</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name} — {fmt(s.price)} {s.unit}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>Quantity / Weight</label>
        <input className="form-control" type="number" step="0.1" min="0.5" value={qty}
          onChange={e => { setQty(e.target.value); onSvcOrQtyChange(serviceId, e.target.value); }} required />
      </div>

      <div className="form-group">
        <label>Computed Amount</label>
        <input className="form-control" type="text" value={amount} readOnly style={{ color: 'var(--warning)', fontWeight: 700 }} />
      </div>

      <div className="form-group">
        <label>Status</label>
        <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
          {['pending', 'washing', 'drying', 'folding', 'ready', 'completed', 'cancelled'].map(s =>
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>Date In</label>
        <input className="form-control" type="date" value={dateIn} onChange={e => setDateIn(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Date Out</label>
        <input className="form-control" type="date" value={dateOut} onChange={e => setDateOut(e.target.value)} />
      </div>

      <div className="form-group full">
        <label>Notes</label>
        <input className="form-control" type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions..." />
      </div>
    </div>
  );

  const footerBtns = (
    <>
      <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={handleSave}>💾 Save Order</button>
    </>
  );

  if (isCpMode) {
    return (
      <AndroidBottomSheet
        isOpen={true}
        onClose={onClose}
        title={orderId ? `✏️ Edit Order #${orderId}` : '➕ New Laundry Intake'}
        subtitle="Staff Mobile Order"
        footer={<div style={{ display: 'flex', gap: '8px', width: '100%' }}>{footerBtns}</div>}
      >
        {formFields}
      </AndroidBottomSheet>
    );
  }

  return (
    <Modal title={orderId ? '✏️ Edit Order' : '➕ New Order'} onClose={onClose} footer={footerBtns}>
      {formFields}
    </Modal>
  );
}

function ViewOrderModal({ orderId, onClose, onAdvance, canEdit, isCpMode }) {
  const order = DB.get('orders').find(o => o.id === orderId);
  if (!order) return null;
  const isWalkin = order.walkin || order.customerId === 'walkin';
  const action = getNextAction(order.status);
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef(null);

  const bodyContent = (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div className="text-xs text-muted mb-4">Customer</div>
          <div className="fw-600">
            {order.customerName}
            {isWalkin && (
              <span className="walkin-badge ml-6">Walk-in</span>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted mb-4">Customer Type</div>
          <div>{isWalkin ? '🚶 Walk-in Customer' : '👤 Registered Account'}</div>
        </div>
        <div>
          <div className="text-xs text-muted mb-4">Phone</div>
          <div className="fw-600">
            {order.customerPhone ? (
              <a href={`tel:${order.customerPhone}`} className="text-cyan underline">📞 {order.customerPhone}</a>
            ) : '—'}
          </div>
        </div>
        <div><div className="text-xs text-muted mb-4">Service</div><div className="fw-600">{order.serviceName}</div></div>
        <div><div className="text-xs text-muted mb-4">Quantity</div><div className="fw-600">{order.quantity} {order.unit}</div></div>
        <div><div className="text-xs text-muted mb-4">Amount</div><div className="text-warning fw-600">{fmt(order.amount)}</div></div>
        <div><div className="text-xs text-muted mb-4">Date In</div><div>{fmtDate(order.dateIn)}</div></div>
        <div><div className="text-xs text-muted mb-4">Status</div><Badge status={order.status} /></div>
        <div>
          <div className="text-xs text-muted mb-4">SMS Notified</div>
          <div>{order.smsNotified ? <span className="badge badge-sent">✓ Sent</span> : <span className="text-muted">No</span>}</div>
        </div>
        {order.notes && (
          <div style={{ gridColumn: '1/-1' }}>
            <div className="text-xs text-muted mb-4">Notes</div>
            <div>{order.notes}</div>
          </div>
        )}
      </div>

      <div className="text-xs text-muted mb-8" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Order Progress</div>
      <OrderProgress status={order.status} />
    </div>
  );

  const footerBtns = (
    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
      <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Close</button>
      {action && canEdit && (
        <button
          className={`btn ${action.color} ${confirming ? 'btn-confirm-pulse' : ''}`}
          style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          onClick={() => {
            if (confirming) {
              if (timerRef.current) clearTimeout(timerRef.current);
              onClose();
              if (onAdvance) onAdvance(order, action);
            } else {
              setConfirming(true);
              timerRef.current = setTimeout(() => setConfirming(false), 4500);
            }
          }}
        >
          {confirming ? (
            <>
              <span className="confirm-pulse-dot">●</span>
              <span>{action.confirmLabel}</span>
            </>
          ) : (
            action.label
          )}
        </button>
      )}
    </div>
  );

  if (isCpMode) {
    return (
      <AndroidBottomSheet
        isOpen={true}
        onClose={onClose}
        title={`Order ${order.id}`}
        subtitle="Order Specification"
        footer={footerBtns}
      >
        {bodyContent}
      </AndroidBottomSheet>
    );
  }

  return (
    <Modal title={`Order ${order.id}`} onClose={onClose} footer={footerBtns}>
      {bodyContent}
    </Modal>
  );
}

export default function Orders() {
  const { currentUser, toast, isCpMode } = useApp();
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [, setTick]           = useState(0);
  const [editId, setEditId]   = useState(undefined);
  const [viewId, setViewId]   = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const confirmTimerRef       = useRef(null);
  const searchRef             = useRef(null);

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, []);

  function handleActionClick(order, action, e) {
    if (e) e.stopPropagation();

    if (confirmingId === order.id) {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      setConfirmingId(null);
      advanceOrderStatus(order.id, action.next, toast, () => setTick(t => t + 1));
    } else {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      setConfirmingId(order.id);
      confirmTimerRef.current = setTimeout(() => {
        setConfirmingId(prev => (prev === order.id ? null : prev));
      }, 4500);
    }
  }

  const canCreate = ['admin', 'staff'].includes(currentUser.role);
  const canEdit   = ['admin', 'staff'].includes(currentUser.role);

  let orders = DB.get('orders');
  const allOrdersCount = orders.length;

  const countPending = orders.filter(o => o.status === 'pending').length;
  const countWashing = orders.filter(o => o.status === 'washing').length;
  const countDrying = orders.filter(o => o.status === 'drying').length;
  const countFolding = orders.filter(o => o.status === 'folding').length;
  const countReady = orders.filter(o => o.status === 'ready').length;
  const countCompleted = orders.filter(o => o.status === 'completed').length;

  if (filter !== 'all') orders = orders.filter(o => o.status === filter);
  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.serviceName.toLowerCase().includes(q) ||
      (o.customerPhone || '').includes(q) ||
      ((o.walkin || o.customerId === 'walkin') && 'walk-in walkin'.includes(q))
    );
  }
  orders = orders.sort((a, b) => new Date(b.created) - new Date(a.created));

  /* ─────────────────────────────────────────────────────────────
     CELLPHONE ("CP") UI/UX FOR STAFF & CUSTOMER
     ───────────────────────────────────────────────────────────── */
  if (isCpMode) {
    return (
      <div className="page active mobile-orders-page" id="page-orders">
        {/* Mobile Search */}
        <div className="mobile-search-bar">
          <div className="mobile-search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              ref={searchRef}
              type="text"
              className="mobile-search-input"
              placeholder="Search Order ID, customer, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear-btn" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>

        {/* Horizontal Scrollable Status Chips */}
        <div className="android-chips-container">
          {[
            { id: 'all', label: 'All', count: allOrdersCount },
            { id: 'pending', label: '⏳ Pending', count: countPending },
            { id: 'washing', label: '🫧 Washing', count: countWashing },
            { id: 'drying', label: '💨 Drying', count: countDrying },
            { id: 'folding', label: '👕 Folding', count: countFolding },
            { id: 'ready', label: '📦 Ready', count: countReady },
            { id: 'completed', label: '✅ Done', count: countCompleted }
          ].map(chip => (
            <button
              key={chip.id}
              className={`android-chip ${filter === chip.id ? 'active' : ''}`}
              onClick={() => setFilter(chip.id)}
            >
              <span>{chip.label}</span>
              <span className="chip-badge">{chip.count}</span>
            </button>
          ))}
        </div>

        {/* Section Header */}
        <div className="mobile-section-header">
          <span className="header-count">{orders.length} Orders</span>
          <span className="header-filter-label">{filter.toUpperCase()}</span>
        </div>

        {/* Mobile Cards List */}
        <div className="mobile-cards-list">
          {orders.length === 0 ? (
            <div className="card">
              <EmptyState icon="🧺" text="No orders found matching your search." />
            </div>
          ) : (
            orders.map(order => {
              const action = getNextAction(order.status);
              const isWalkin = order.walkin || order.customerId === 'walkin';

              return (
                <div key={order.id} className="android-order-card">
                  <div className="card-top-row">
                    <div className="order-id-group">
                      <span className="order-id-pill" onClick={() => {
                        navigator.clipboard?.writeText(order.id);
                        toast('info', 'Copied!', `Order ${order.id} copied`);
                      }}>
                        {order.id} 📋
                      </span>
                      <span className="order-date-text">{fmtDate(order.dateIn)}</span>
                    </div>
                    <Badge status={order.status} />
                  </div>

                  <div className="card-customer-row">
                    <div className="customer-name-block">
                      <span className="customer-avatar">
                        {order.customerName ? order.customerName.charAt(0).toUpperCase() : 'U'}
                      </span>
                      <div>
                        <div className="customer-name-text">
                          {order.customerName}
                          {isWalkin && <span className="walkin-badge">Walk-in</span>}
                        </div>
                        {order.customerPhone && (
                          <div className="customer-phone-sub">
                            <a href={`tel:${order.customerPhone}`} className="phone-tap-link">
                              📞 {order.customerPhone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="order-price-block">
                      <span className="price-amount">{fmt(order.amount)}</span>
                      <span className="weight-tag">{order.quantity} {order.unit}</span>
                    </div>
                  </div>

                  <div className="card-service-row">
                    <span className="service-name-tag">🧺 {order.serviceName}</span>
                    {order.smsNotified ? (
                      <span className="sms-sent-tag">📱 SMS Alert Sent</span>
                    ) : order.customerPhone && order.status === 'ready' ? (
                      <button
                        className="btn-send-sms-urgent"
                        onClick={() => sendSMSAction(order.id, toast, () => setTick(t => t + 1))}
                      >
                        ⚡ Send Ready SMS
                      </button>
                    ) : null}
                  </div>

                  {order.notes && (
                    <div className="card-notes-row">
                      <span className="notes-icon">📝</span>
                      <span className="notes-text">{order.notes}</span>
                    </div>
                  )}

                  <div className="card-actions-bar">
                    {action && canEdit && (
                      <button
                        className={`btn-hero-action ${action.color} ${confirmingId === order.id ? 'btn-confirm-pulse' : ''}`}
                        onClick={(e) => handleActionClick(order, action, e)}
                      >
                        {confirmingId === order.id ? (
                          <>
                            <span className="confirm-pulse-dot">●</span>
                            <span>{action.confirmLabel}</span>
                          </>
                        ) : (
                          action.label
                        )}
                      </button>
                    )}

                    {confirmingId === order.id && (
                      <button
                        type="button"
                        className="icon-action-btn btn-cancel-confirm"
                        title="Cancel"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
                          setConfirmingId(null);
                        }}
                      >
                        ✕
                      </button>
                    )}

                    <div className="secondary-action-buttons">
                      <button
                        className="icon-action-btn"
                        onClick={() => setViewId(order.id)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      {canEdit && (
                        <button
                          className="icon-action-btn"
                          onClick={() => setEditId(order.id)}
                          title="Edit Order"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Floating Action Button */}
        {canCreate && (
          <FloatingActionButton
            icon="➕"
            label="Intake"
            title="New Order Intake"
            onClick={() => setEditId(null)}
          />
        )}

        {editId !== undefined && (
          <OrderModal
            orderId={editId}
            onClose={() => setEditId(undefined)}
            onSaved={() => setTick(t => t + 1)}
            toast={toast}
            isCpMode={true}
          />
        )}
        {viewId && (
          <ViewOrderModal
            orderId={viewId}
            onClose={() => setViewId(null)}
            onAdvance={(o, act) => advanceOrderStatus(o.id, act.next, toast, () => setTick(t => t + 1))}
            canEdit={canEdit}
            isCpMode={true}
          />
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     ORIGINAL DESKTOP UI/UX FOR STAFF & USERS
     ───────────────────────────────────────────────────────────── */
  return (
    <div className="page active" id="page-orders">
      <div className="filter-bar">
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search by Order ID, customer, service, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          {['all', 'pending', 'washing', 'drying', 'folding', 'ready', 'completed', 'cancelled'].map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        {canCreate && <button className="btn btn-primary btn-sm" onClick={() => setEditId(null)}>➕ New Order</button>}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">🧺 Orders <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 400 }}>({orders.length} records)</span></div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Phone</th>
                <th>Service</th><th>Qty</th><th>Amount</th>
                <th>Date In</th><th>Status</th><th>SMS</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={10}><EmptyState icon="📭" text="No orders found" /></td></tr>
              ) : (
                orders.map(o => {
                  const action = getNextAction(o.status);
                  return (
                    <tr key={o.id}>
                      <td className="text-cyan font-mono" style={{ fontSize: '12px' }}>{o.id}</td>
                      <td className="fw-600">
                        {o.customerName}
                        {(o.walkin || o.customerId === 'walkin') && (
                          <span className="walkin-badge ml-6">Walk-in</span>
                        )}
                      </td>
                      <td className="text-muted text-sm">{o.customerPhone || '—'}</td>
                      <td>{o.serviceName}</td>
                      <td>{o.quantity} {o.unit}</td>
                      <td className="text-warning fw-600">{fmt(o.amount)}</td>
                      <td className="text-sm">{fmtDate(o.dateIn)}</td>
                      <td><Badge status={o.status} /></td>
                      <td>{o.smsNotified ? <span className="badge badge-sent">✓ Sent</span> : <span className="text-muted text-xs">—</span>}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {action && canEdit && (
                            <button
                              className={`btn btn-sm ${action.color} ${confirmingId === o.id ? 'btn-confirm-pulse' : ''}`}
                              onClick={(e) => handleActionClick(o, action, e)}
                              title={confirmingId === o.id ? 'Click again to confirm' : `Advance to ${action.next}`}
                            >
                              {confirmingId === o.id ? (
                                <>
                                  <span className="confirm-pulse-dot">●</span>
                                  <span>{action.confirmLabel}</span>
                                </>
                              ) : (
                                action.label
                              )}
                            </button>
                          )}
                          {confirmingId === o.id && (
                            <button
                              type="button"
                              className="btn btn-sm btn-cancel-confirm"
                              style={{ padding: '4px 8px' }}
                              title="Cancel"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
                                setConfirmingId(null);
                              }}
                            >
                              ✕
                            </button>
                          )}
                          <button className="btn btn-secondary btn-sm" onClick={() => setViewId(o.id)}>👁 View</button>
                          {canEdit && <button className="btn btn-warning btn-sm" onClick={() => setEditId(o.id)}>✏️</button>}
                          {canEdit && o.status === 'ready' && !o.smsNotified && o.customerPhone && (
                            <button className="btn btn-success btn-sm" onClick={() => sendSMSAction(o.id, toast, () => setTick(t => t + 1))}>📱 SMS</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editId !== undefined && (
        <OrderModal
          orderId={editId}
          onClose={() => setEditId(undefined)}
          onSaved={() => setTick(t => t + 1)}
          toast={toast}
          isCpMode={false}
        />
      )}
      {viewId && (
        <ViewOrderModal
          orderId={viewId}
          onClose={() => setViewId(null)}
          onAdvance={(o, act) => advanceOrderStatus(o.id, act.next, toast, () => setTick(t => t + 1))}
          canEdit={canEdit}
          isCpMode={false}
        />
      )}
    </div>
  );
}
