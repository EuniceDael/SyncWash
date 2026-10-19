import { useState } from 'react';
import { DB, genId, fmt } from '../db';
import { useApp } from '../AppContext';

const STATUS_STEPS = [
  { icon: '🧺', label: 'Pick Service' },
  { icon: '⚖️', label: 'Details' },
  { icon: '✅', label: 'Confirm' }
];

export default function NewOrder({ onNavigate }) {
  const { currentUser, toast, isCpMode } = useApp();
  const services = DB.get('services');

  const [step, setStep] = useState(0);
  const [selectedSvc, setSvc] = useState(services[0]?.id || null);
  const [quantity, setQty] = useState(String(services[0]?.minWeight || 3));
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(null);

  const svc = services.find(s => s.id === selectedSvc);
  const qty = parseFloat(quantity) || 0;
  const minOk = svc ? qty >= svc.minWeight : false;
  const total = svc && qty ? +(qty * svc.price).toFixed(2) : 0;

  function nextStep() { setStep(s => Math.min(s + 1, 2)); }
  function prevStep() { setStep(s => Math.max(s - 1, 0)); }

  function selectService(id) {
    setSvc(id);
    const s = services.find(x => x.id === id);
    if (s) setQty(String(s.minWeight));
  }

  function handleSubmit() {
    if (!svc || !minOk) return;

    const orders = DB.get('orders');
    const newOrder = {
      id: 'ORD-' + Date.now().toString().slice(-6),
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone || '',
      serviceId: svc.id,
      serviceName: svc.name,
      servicePrice: svc.price,
      quantity: qty,
      unit: svc.unit,
      amount: total,
      status: 'pending',
      staffId: '',
      staffName: '',
      dateIn: new Date().toISOString().split('T')[0],
      dateOut: null,
      notes: notes.trim(),
      smsNotified: false,
      created: new Date().toISOString()
    };

    orders.unshift(newOrder);
    DB.set('orders', orders);

    if (currentUser.phone) {
      const logs = DB.get('smsLogs');
      logs.unshift({
        id: genId('SMS'),
        orderId: newOrder.id,
        phone: currentUser.phone,
        customerName: currentUser.name,
        type: 'received',
        message: `Hi ${currentUser.name}, your SmartLaundry booking #${newOrder.id} (${svc.name}) has been received! Bring your items to our shop anytime.`,
        status: 'sent',
        timestamp: new Date().toISOString()
      });
      DB.set('smsLogs', logs);
    }

    toast('success', 'Order Placed Successfully! 🎉', `Order ID: ${newOrder.id}`);
    setSubmitted(newOrder);
  }

  /* ─────────────────────────────────────────────────────────────
     SUCCESS VIEW (Works for both Desktop and Mobile)
     ───────────────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="page active" id="page-neworder">
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.3)',
            borderRadius: '20px', padding: '36px 28px'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '14px' }}>🎉</div>
            <h2 style={{ fontFamily: "'Orbitron',monospace", color: 'var(--success)', marginBottom: '8px' }}>
              Order Placed!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '13px' }}>
              Your laundry order has been received. We'll start processing it shortly.
            </p>

            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'left'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  ['Order ID', submitted.id],
                  ['Service', submitted.serviceName],
                  ['Quantity', `${submitted.quantity} ${submitted.unit}`],
                  ['Total', fmt(submitted.amount)],
                  ['Status', '🟡 Pending'],
                  ['Date', submitted.dateIn]
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{k}</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => onNavigate('track', submitted.id)}>
                🔍 Track Order
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSubmitted(null);
                  setStep(0);
                  selectService(services[0]?.id);
                }}
              >
                ➕ New Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     CELLPHONE ("CP") UI/UX FOR CUSTOMER
     ───────────────────────────────────────────────────────────── */
  if (isCpMode) {
    return (
      <div className="page active mobile-neworder-page" id="page-neworder">
        <div className="android-stepper-header">
          {STATUS_STEPS.map((s, i) => (
            <div key={i} className={`step-item ${i <= step ? 'step-active' : ''}`}>
              <div className="step-circle">{i < step ? '✓' : s.icon}</div>
              <div className="step-label">{s.label}</div>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="neworder-step-content">
            <div className="mobile-section-header">
              <div>
                <h2 className="mobile-page-heading">Select Laundry Service</h2>
                <p className="mobile-page-sub">Choose the right wash for your clothes</p>
              </div>
            </div>

            <div className="service-selection-grid">
              {services.map(s => {
                const isSelected = selectedSvc === s.id;
                return (
                  <div
                    key={s.id}
                    className={`service-touch-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => selectService(s.id)}
                  >
                    <div className="service-card-left">
                      <div className="service-icon">🧺</div>
                      <div>
                        <div className="service-name">{s.name}</div>
                        <div className="service-desc">{s.description}</div>
                        <div className="service-min">Min: {s.minWeight} {s.unit.replace('per ', '')}</div>
                      </div>
                    </div>
                    <div className="service-card-right">
                      <div className="service-price">{fmt(s.price)}</div>
                      <div className="service-unit">{s.unit}</div>
                      <div className={`radio-dot ${isSelected ? 'checked' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="btn btn-primary w-full mt-20"
              disabled={!selectedSvc}
              onClick={nextStep}
            >
              Continue: Weight & Notes →
            </button>
          </div>
        )}

        {step === 1 && svc && (
          <div className="neworder-step-content">
            <div className="mobile-section-header">
              <div>
                <h2 className="mobile-page-heading">Weight & Instructions</h2>
                <p className="mobile-page-sub">{svc.name} — {fmt(svc.price)} {svc.unit}</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={prevStep}>← Back</button>
            </div>

            <div className="card mb-16">
              <div className="card-body">
                <label className="text-sm text-muted mb-8 d-block">Estimated Weight ({svc.unit})</label>
                <div className="mobile-stepper mb-12">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => {
                      const next = Math.max(svc.minWeight, +(qty - 0.5).toFixed(1));
                      setQty(String(next));
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min={svc.minWeight}
                    className="stepper-input"
                    value={quantity}
                    onChange={e => setQty(e.target.value)}
                  />
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => {
                      const next = +(qty + 0.5).toFixed(1);
                      setQty(String(next));
                    }}
                  >
                    +
                  </button>
                </div>

                <div className="stepper-presets mb-16">
                  {[3, 5, 8, 10, 15].map(v => (
                    <button
                      key={v}
                      type="button"
                      className={`preset-chip ${qty === v ? 'preset-chip-active' : ''}`}
                      onClick={() => setQty(String(v))}
                    >
                      {v} kg
                    </button>
                  ))}
                </div>

                {!minOk && (
                  <div className="text-danger text-xs mb-12">
                    ⚠️ Minimum allowed for {svc.name} is {svc.minWeight} {svc.unit.replace('per ', '')}
                  </div>
                )}

                <div className="form-group mb-0">
                  <label className="text-xs text-muted mb-4">Special Instructions (optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Wash white shirts separately..."
                  />
                </div>
              </div>
            </div>

            <div className="mobile-price-banner mb-20">
              <span className="price-label">Estimated Total:</span>
              <span className="price-value">{total > 0 ? fmt(total) : '—'}</span>
            </div>

            <button
              className="btn btn-primary w-full"
              disabled={!minOk}
              onClick={nextStep}
            >
              Review & Confirm →
            </button>
          </div>
        )}

        {step === 2 && svc && (
          <div className="neworder-step-content">
            <div className="mobile-section-header">
              <div>
                <h2 className="mobile-page-heading">Confirm Booking</h2>
                <p className="mobile-page-sub">Check details before submitting</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={prevStep}>← Back</button>
            </div>

            <div className="mobile-summary-card mb-20">
              <div className="summary-row">
                <span className="text-muted">Customer</span>
                <span className="fw-600">{currentUser.name}</span>
              </div>
              <div className="summary-row">
                <span className="text-muted">SMS Alert Phone</span>
                <span className="text-cyan">{currentUser.phone || '—'}</span>
              </div>
              <div className="summary-row">
                <span className="text-muted">Service</span>
                <span className="fw-600">{svc.name}</span>
              </div>
              <div className="summary-row">
                <span className="text-muted">Quantity</span>
                <span>{qty} {svc.unit}</span>
              </div>
              <div className="summary-row">
                <span className="text-muted">Rate</span>
                <span>{fmt(svc.price)} / {svc.unit.replace('per ', '')}</span>
              </div>
              {notes && (
                <div className="summary-row">
                  <span className="text-muted">Notes</span>
                  <span className="text-sm">{notes}</span>
                </div>
              )}
              <div className="summary-total-row">
                <span>TOTAL ESTIMATE</span>
                <span className="total-amount">{fmt(total)}</span>
              </div>
            </div>

            <button className="btn btn-primary w-full" onClick={handleSubmit}>
              🧺 PLACE LAUNDRY ORDER ({fmt(total)})
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     ORIGINAL DESKTOP UI/UX FOR CUSTOMER & USERS
     ───────────────────────────────────────────────────────────── */
  return (
    <div className="page active" id="page-neworder">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px', gap: '0' }}>
          {STATUS_STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'unset' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                  background: i <= step ? 'var(--accent-cyan)' : 'var(--bg-card)',
                  border: `2px solid ${i <= step ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                  transition: 'all 0.3s', boxShadow: i === step ? '0 0 12px rgba(0,212,255,0.5)' : 'none'
                }}>
                  {i < step ? '✓' : s.icon}
                </div>
                <div style={{
                  fontSize: '11px', marginTop: '4px', whiteSpace: 'nowrap',
                  color: i === step ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontWeight: i === step ? 700 : 400
                }}>{s.label}</div>
              </div>
              {i < 2 && (
                <div style={{
                  flex: 1, height: '2px', marginBottom: '18px',
                  background: i < step ? 'var(--accent-cyan)' : 'var(--border-color)',
                  transition: 'background 0.3s'
                }} />
              )}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">🧺 Choose a Service</div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gap: '12px' }}>
                {services.map(s => (
                  <div
                    key={s.id}
                    onClick={() => selectService(s.id)}
                    style={{
                      padding: '16px 20px', borderRadius: '12px', cursor: 'pointer',
                      border: `2px solid ${selectedSvc === s.id ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                      background: selectedSvc === s.id ? 'rgba(0,212,255,0.08)' : 'var(--bg-card)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.2s',
                      boxShadow: selectedSvc === s.id ? '0 0 10px rgba(0,212,255,0.2)' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{s.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.description}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Min: {s.minWeight} {s.unit.replace('per ', '')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '18px', color: 'var(--accent-yellow)', fontWeight: 700 }}>
                        {fmt(s.price)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.unit}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '20px' }}
                disabled={!selectedSvc}
                onClick={nextStep}
              >
                Next: Enter Details →
              </button>
            </div>
          </div>
        )}

        {step === 1 && svc && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">⚖️ Order Details</div>
              <button className="btn btn-secondary btn-sm" onClick={prevStep}>← Back</button>
            </div>
            <div className="card-body">
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: '10px', padding: '14px 18px', marginBottom: '20px'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{svc.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{svc.description}</div>
                </div>
                <div style={{ fontFamily: "'Orbitron',monospace", color: 'var(--accent-yellow)', fontWeight: 700 }}>
                  {fmt(svc.price)}<span style={{ fontSize: '11px', color: 'var(--text-muted)' }}> / {svc.unit.replace('per ', '')}</span>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Quantity <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({svc.unit})</span>
                </label>
                <div className="input-group">
                  <span className="input-icon">⚖️</span>
                  <input
                    className="form-control"
                    type="number"
                    min={svc.minWeight}
                    step="0.1"
                    value={quantity}
                    onChange={e => setQty(e.target.value)}
                    placeholder={`Min. ${svc.minWeight}`}
                    required
                  />
                </div>
                {qty > 0 && !minOk && (
                  <div style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>
                    ❌ Minimum is {svc.minWeight} {svc.unit.replace('per ', '')}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Special Instructions <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Handle with care, separate whites..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(255,179,0,0.07)', border: '1px solid rgba(255,179,0,0.25)',
                borderRadius: '10px', padding: '14px 18px', marginBottom: '20px'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Total</span>
                <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '22px', color: 'var(--accent-yellow)', fontWeight: 700 }}>
                  {total > 0 ? fmt(total) : '—'}
                </span>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={!minOk}
                onClick={nextStep}
              >
                Next: Confirm Order →
              </button>
            </div>
          </div>
        )}

        {step === 2 && svc && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">✅ Confirm Your Order</div>
              <button className="btn btn-secondary btn-sm" onClick={prevStep}>← Back</button>
            </div>
            <div className="card-body">
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '12px', overflow: 'hidden', marginBottom: '20px'
              }}>
                {[
                  ['Service', svc.name],
                  ['Description', svc.description],
                  ['Quantity', `${qty} ${svc.unit}`],
                  ['Unit Price', fmt(svc.price)],
                  ['Notes', notes || '—'],
                  ['Customer', currentUser.name],
                  ['Date', new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })]
                ].map(([k, v], i) => (
                  <div key={k} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '12px 18px',
                    borderBottom: i < 6 ? '1px solid var(--border-color)' : 'none',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                  }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{k}</span>
                    <span style={{ fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}

                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 18px', background: 'rgba(255,179,0,0.07)',
                  borderTop: '2px solid rgba(255,179,0,0.3)'
                }}>
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>TOTAL AMOUNT</span>
                  <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '22px', color: 'var(--accent-yellow)', fontWeight: 700 }}>
                    {fmt(total)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={prevStep}>
                  ← Edit
                </button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit} id="placeOrderBtn">
                  🧺 PLACE ORDER
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
