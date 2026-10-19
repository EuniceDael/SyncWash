import { useState } from 'react';
import { DB, fmt, genId } from '../db';
import { useApp } from '../AppContext';
import AndroidBottomSheet from '../components/AndroidBottomSheet';

function ServiceModal({ serviceId, onClose, onSaved, toast }) {
  const svc = serviceId ? DB.get('services').find(s => s.id === serviceId) : null;
  const [name, setName] = useState(svc?.name || '');
  const [price, setPrice] = useState(svc?.price || '');
  const [unit, setUnit] = useState(svc?.unit || 'per kg');
  const [desc, setDesc] = useState(svc?.description || '');

  function handleSave() {
    if (!name || isNaN(parseFloat(price))) {
      toast('warning', 'Incomplete', 'Please fill all required fields.');
      return;
    }
    const services = DB.get('services');
    if (serviceId) {
      const idx = services.findIndex(s => s.id === serviceId);
      if (idx >= 0) services[idx] = { ...services[idx], name, price: parseFloat(price), unit, description: desc };
    } else {
      services.push({ id: genId('s'), name, price: parseFloat(price), unit, description: desc, minWeight: 3 });
    }
    DB.set('services', services);
    toast('success', serviceId ? 'Service Updated' : 'Service Created', name);
    onSaved();
    onClose();
  }

  return (
    <AndroidBottomSheet
      isOpen={true}
      onClose={onClose}
      title={serviceId ? '✏️ Edit Service' : '➕ New Service'}
      subtitle="Price Configuration"
      footer={
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1.5 }} onClick={handleSave}>💾 Save Service</button>
        </div>
      }
    >
      <div className="form-group">
        <label className="text-xs text-muted mb-4">Service Name</label>
        <input className="form-control" type="text" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="text-xs text-muted mb-4">Price (₱)</label>
          <input className="form-control" type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="text-xs text-muted mb-4">Unit</label>
          <select className="form-control" value={unit} onChange={e => setUnit(e.target.value)}>
            {['per kg', 'per piece', 'per set', 'per pair', 'per load'].map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="text-xs text-muted mb-4">Description</label>
        <input className="form-control" type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Brief description..." />
      </div>
    </AndroidBottomSheet>
  );
}

export default function Services({ onNavigate }) {
  const { currentUser, toast } = useApp();
  const [tick, setTick] = useState(0);
  const [editId, setEditId] = useState(undefined);
  const [estKg, setEstKg] = useState(5);
  const canManage = ['admin', 'owner'].includes(currentUser.role);
  const isCustomer = currentUser.role === 'customer';
  const services = DB.get('services');

  function deleteService(id) {
    if (!confirm('Delete this service?')) return;
    DB.set('services', DB.get('services').filter(s => s.id !== id));
    toast('info', 'Service Deleted', 'Service removed.');
    setTick(t => t + 1);
  }

  return (
    <div className="page active mobile-services-page" id="page-services">
      {/* Header */}
      <div className="mobile-section-header">
        <div>
          <h2 className="mobile-page-heading">Price Catalog</h2>
          <p className="mobile-page-sub">Transparent laundry rates and packages</p>
        </div>
        {canManage && (
          <button className="btn btn-primary btn-sm" onClick={() => setEditId(null)}>
            ➕ Add Service
          </button>
        )}
      </div>

      {/* Interactive Quick Price Estimator */}
      <div className="calculator-widget-card mb-20">
        <div className="widget-header">
          <span className="widget-icon">⚡</span>
          <span className="widget-title">Quick Cost Estimator</span>
        </div>
        <p className="widget-sub">Enter laundry weight to see instant estimated rates:</p>
        <div className="estimator-slider-wrap">
          <div className="estimator-value-bubble">{estKg} kg</div>
          <input
            type="range"
            min="1"
            max="25"
            step="1"
            value={estKg}
            onChange={e => setEstKg(parseInt(e.target.value))}
            className="estimator-range-slider"
          />
          <div className="slider-ticks">
            <span>1 kg</span>
            <span>5 kg</span>
            <span>10 kg</span>
            <span>15 kg</span>
            <span>25 kg</span>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mobile-services-stack">
        {services.map(s => {
          const estimatedCost = s.unit.includes('kg') ? +(estKg * s.price).toFixed(2) : s.price;
          return (
            <div key={s.id} className="android-service-card">
              <div className="service-card-top">
                <div className="service-badge-icon">🧺</div>
                <div className="service-title-col">
                  <div className="service-card-name">{s.name}</div>
                  <div className="service-card-desc">{s.description}</div>
                </div>
                <div className="service-rate-col">
                  <div className="service-rate-num">{fmt(s.price)}</div>
                  <div className="service-rate-unit">{s.unit}</div>
                </div>
              </div>

              {/* Dynamic estimate for weight */}
              {s.unit.includes('kg') && (
                <div className="service-calc-pill">
                  <span>For {estKg} kg:</span>
                  <strong className="text-warning font-mono">{fmt(estimatedCost)}</strong>
                </div>
              )}

              <div className="service-card-footer">
                <span className="min-tag">Min. weight: {s.minWeight} {s.unit.replace('per ', '')}</span>
                {isCustomer && onNavigate && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onNavigate('neworder')}
                  >
                    Book Now →
                  </button>
                )}
                {canManage && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditId(s.id)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteService(s.id)}>🗑️</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editId !== undefined && (
        <ServiceModal
          serviceId={editId}
          onClose={() => setEditId(undefined)}
          onSaved={() => setTick(t => t + 1)}
          toast={toast}
        />
      )}
    </div>
  );
}
