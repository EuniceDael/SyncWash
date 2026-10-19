import { fmt, fmtDate } from '../db';

export function Badge({ status }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>
      <span className="status-dot"></span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function StatCard({ accent, icon, iconBg, value, label, trend }) {
  return (
    <div className="stat-card" style={{ '--card-accent': accent }}>
      <div className="stat-header">
        <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
        {trend && <span className="stat-trend trend-up">{trend}</span>}
      </div>
      <div className="stat-value" style={typeof value === 'string' && value.includes('₱') ? { fontSize: '20px' } : {}}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function Modal({ id, title, children, footer, onClose }) {
  return (
    <div className="modal-overlay open" id={id} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <div className="modal-close" onClick={onClose}>✕</div>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function OrderProgress({ status }) {
  const steps = [
    { status: 'pending',   icon: '📥', label: 'Received' },
    { status: 'washing',   icon: '🫧', label: 'Washing'  },
    { status: 'drying',    icon: '💨', label: 'Drying'   },
    { status: 'folding',   icon: '👕', label: 'Folding'  },
    { status: 'ready',     icon: '✅', label: 'Ready'    },
    { status: 'completed', icon: '🏠', label: 'Picked Up'}
  ];
  const all = ['pending','washing','drying','folding','ready','completed'];
  const cur = all.indexOf(status);
  return (
    <div className="order-progress">
      {steps.map((s, i) => {
        const si = all.indexOf(s.status);
        let state = '';
        if (status !== 'cancelled') {
          if (si < cur) state = 'done';
          else if (si === cur) state = 'active';
        }
        return (
          <div key={s.status} className={`progress-step ${state}`}>
            <div className="step-circle">{state === 'done' ? '✓' : s.icon}</div>
            <div className="step-label">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function EmptyState({ icon, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{text}</p>
    </div>
  );
}
