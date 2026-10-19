import { useState } from 'react';
import { DB, fmt, fmtDate } from '../db';
import { useApp } from '../AppContext';
import { Badge, EmptyState } from '../components/UI';
import AndroidBottomSheet from '../components/AndroidBottomSheet';

function OrderReceiptSheet({ order, onClose, onTrack }) {
  if (!order) return null;
  return (
    <AndroidBottomSheet
      isOpen={true}
      onClose={onClose}
      title={`🧾 Receipt #${order.id}`}
      subtitle="Digital Laundry Receipt"
      footer={
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Close</button>
          <button className="btn btn-primary" style={{ flex: 1.5 }} onClick={() => { onClose(); onTrack(order.id); }}>
            🔍 Track Live
          </button>
        </div>
      }
    >
      <div className="receipt-content">
        <div className="receipt-store-header">
          <div className="receipt-logo">🧺 SMARTLAUNDRY</div>
          <div className="receipt-tagline">Quality Care For Your Clothes</div>
          <div className="receipt-date">{fmtDate(order.dateIn)} • Metro Branch</div>
        </div>

        <div className="receipt-divider-dashed" />

        <div className="receipt-row">
          <span>Customer:</span>
          <strong>{order.customerName}</strong>
        </div>
        <div className="receipt-row">
          <span>Phone:</span>
          <span>{order.customerPhone || '—'}</span>
        </div>
        <div className="receipt-row">
          <span>Status:</span>
          <span><Badge status={order.status} /></span>
        </div>

        <div className="receipt-divider-dashed" />

        <div className="receipt-row">
          <span>{order.serviceName} ({order.quantity} {order.unit})</span>
          <strong>{fmt(order.amount)}</strong>
        </div>

        <div className="receipt-divider-dashed" />

        <div className="receipt-total-row">
          <span>Total Paid / Due:</span>
          <span className="total-val">{fmt(order.amount)}</span>
        </div>
      </div>
    </AndroidBottomSheet>
  );
}

export default function MyOrders({ onNavigate }) {
  const { currentUser, isCpMode } = useApp();
  const [filter, setFilter] = useState('all');
  const [receiptOrder, setReceiptOrder] = useState(null);

  const rawOrders = DB.get('orders')
    .filter(o => o.customerId === currentUser?.id)
    .sort((a, b) => new Date(b.created) - new Date(a.created));

  let filtered = [...rawOrders];
  if (filter === 'active') {
    filtered = filtered.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  } else if (filter === 'completed') {
    filtered = filtered.filter(o => o.status === 'completed');
  }

  /* ─────────────────────────────────────────────────────────────
     CELLPHONE ("CP") UI/UX FOR CUSTOMER
     ───────────────────────────────────────────────────────────── */
  if (isCpMode) {
    return (
      <div className="page active mobile-myorders-page" id="page-myorders">
        <div className="mobile-section-header">
          <div>
            <h2 className="mobile-page-heading">My Laundry Orders</h2>
            <p className="mobile-page-sub">Track active orders & receipts</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('neworder')}>
            ➕ Book New
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mobile-tabs-pill-bar">
          {[
            { id: 'all', label: `All (${rawOrders.length})` },
            { id: 'active', label: `In Progress (${rawOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length})` },
            { id: 'completed', label: `Past (${rawOrders.filter(o => o.status === 'completed').length})` }
          ].map(tab => (
            <button
              key={tab.id}
              className={`pill-tab-btn ${filter === tab.id ? 'active' : ''}`}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Mobile Stack */}
        <div className="mobile-order-cards-stack">
          {filtered.length === 0 ? (
            <div className="card">
              <EmptyState icon="🧺" text="No laundry orders in this view." />
            </div>
          ) : (
            filtered.map(order => (
              <div key={order.id} className="customer-order-card">
                <div className="cust-card-top">
                  <div className="cust-card-id-block">
                    <span className="cust-card-id">{order.id}</span>
                    <span className="cust-card-date">{fmtDate(order.dateIn)}</span>
                  </div>
                  <Badge status={order.status} />
                </div>

                <div className="cust-card-service-row">
                  <div className="cust-service-info">
                    <div className="cust-service-name">🧺 {order.serviceName}</div>
                    <div className="cust-service-qty">{order.quantity} {order.unit}</div>
                  </div>
                  <div className="cust-service-price">
                    {fmt(order.amount)}
                  </div>
                </div>

                <div className="cust-card-footer-actions">
                  <button
                    className="btn-card-action btn-track"
                    onClick={() => onNavigate('track', order.id)}
                  >
                    🔍 Track Live
                  </button>
                  <button
                    className="btn-card-action btn-receipt"
                    onClick={() => setReceiptOrder(order)}
                  >
                    🧾 Receipt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {receiptOrder && (
          <OrderReceiptSheet
            order={receiptOrder}
            onClose={() => setReceiptOrder(null)}
            onTrack={orderId => onNavigate('track', orderId)}
          />
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     ORIGINAL DESKTOP UI/UX FOR CUSTOMER
     ───────────────────────────────────────────────────────────── */
  return (
    <div className="page active" id="page-myorders">
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            📋 My Orders <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 400 }}>({rawOrders.length})</span>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Service</th><th>Qty</th><th>Amount</th><th>Date In</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rawOrders.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon="📭" text="No orders found" /></td></tr>
              ) : (
                rawOrders.map(o => (
                  <tr key={o.id}>
                    <td className="text-cyan font-mono" style={{ fontSize: '12px' }}>{o.id}</td>
                    <td className="fw-600">{o.serviceName}</td>
                    <td>{o.quantity} {o.unit}</td>
                    <td className="text-warning fw-600">{fmt(o.amount)}</td>
                    <td className="text-sm">{fmtDate(o.dateIn)}</td>
                    <td><Badge status={o.status} /></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('track', o.id)}>
                        🔍 Track
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
