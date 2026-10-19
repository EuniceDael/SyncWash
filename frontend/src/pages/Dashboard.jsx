import { DB, fmt, fmtDate } from '../db';
import { StatCard, Badge } from '../components/UI';
import { useApp } from '../AppContext';

export default function Dashboard({ onNavigate }) {
  const { currentUser } = useApp();
  const orders  = DB.get('orders');
  const users   = DB.get('users');
  const today   = new Date().toISOString().split('T')[0];
  const thisMonth = today.slice(0, 7);

  const totalOrders   = orders.length;
  const todayOrders   = orders.filter(o => o.dateIn === today).length;
  const activeOrders  = orders.filter(o => !['completed','cancelled'].includes(o.status)).length;
  const readyCount    = orders.filter(o => o.status === 'ready').length;
  const customerCount = users.filter(u => u.role === 'customer' && u.status === 'active').length;
  const monthRevenue  = orders.filter(o => o.dateIn?.startsWith(thisMonth) && o.status === 'completed').reduce((s,o) => s + o.amount, 0);
  const totalRevenue  = orders.filter(o => o.status === 'completed').reduce((s,o) => s + o.amount, 0);

  // Revenue last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const rev = orders.filter(o => o.dateIn === ds && o.status === 'completed').reduce((s,o) => s + o.amount, 0);
    days.push({ label: d.toLocaleDateString('en-PH', { weekday: 'short' }), rev });
  }
  const maxRev = Math.max(...days.map(d => d.rev), 1);

  const statusCounts = {};
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const recent = [...orders].sort((a,b) => new Date(b.created) - new Date(a.created)).slice(0, 8);

  return (
    <div className="page active" id="page-dashboard">
      <div className="stats-grid">
        <StatCard accent="var(--accent-cyan)"   icon="🧺" iconBg="rgba(0,212,255,0.1)"  value={totalOrders}      label="Total Orders"      trend={`▲ ${todayOrders} today`} />
        <StatCard accent="var(--accent-orange)" icon="⏳" iconBg="rgba(255,107,53,0.1)" value={activeOrders}     label="Active Orders"     trend={String(activeOrders)} />
        <StatCard accent="var(--success)"       icon="✅" iconBg="rgba(0,255,136,0.1)"  value={readyCount}       label="Ready for Pickup"  trend={`${readyCount} ready`} />
        <StatCard accent="var(--warning)"       icon="💰" iconBg="rgba(255,215,0,0.1)"  value={fmt(monthRevenue)} label="Monthly Revenue"   trend="This month" />
        <StatCard accent="var(--accent-purple)" icon="👥" iconBg="rgba(124,58,237,0.1)" value={customerCount}    label="Active Customers"  trend="Active" />
        <StatCard accent="var(--accent-teal)"   icon="💵" iconBg="rgba(0,184,160,0.1)"  value={fmt(totalRevenue)} label="Total Revenue"     trend="All time" />
      </div>

      <div className="grid-2 mb-24">
        <div className="card col-span-2">
          <div className="card-header"><div className="card-title">📊 Revenue — Last 7 Days</div></div>
          <div className="card-body">
            <div className="chart-container">
              {days.map(d => (
                <div key={d.label} className="chart-bar-group">
                  <div className="chart-bar" data-value={fmt(d.rev)}
                    style={{ height: `${maxRev > 0 ? Math.max((d.rev/maxRev)*180,4) : 4}px`, background: 'linear-gradient(180deg,var(--accent-cyan),var(--accent-teal))' }} />
                  <div className="chart-label">{d.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Recent Orders</div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('orders')}>View All</button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Service</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {recent.map(o => (
                  <tr key={o.id}>
                    <td className="text-cyan font-mono" style={{fontSize:'12px'}}>{o.id}</td>
                    <td>{o.customerName}</td>
                    <td>{o.serviceName}</td>
                    <td className="text-warning fw-600">{fmt(o.amount)}</td>
                    <td><Badge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">🥧 Order Status Breakdown</div></div>
          <div className="card-body">
            {Object.entries(statusCounts).map(([s, c]) => (
              <div key={s} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'14px'}}>
                <div style={{flex:1}}><Badge status={s} /></div>
                <div style={{flex:3,background:'rgba(0,212,255,0.06)',borderRadius:'4px',height:'8px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${(c/totalOrders*100).toFixed(1)}%`,background:'linear-gradient(90deg,var(--accent-cyan),var(--accent-teal))',borderRadius:'4px'}} />
                </div>
                <div style={{fontSize:'13px',fontWeight:600,minWidth:'30px',textAlign:'right'}}>{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
