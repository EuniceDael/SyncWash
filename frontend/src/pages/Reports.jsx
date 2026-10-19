import { DB, fmt } from '../db';

export default function Reports() {
  const orders    = DB.get('orders');
  const completed = orders.filter(o => o.status === 'completed');
  const totalRevenue = completed.reduce((s,o) => s + o.amount, 0);
  const avgOrder     = completed.length > 0 ? totalRevenue / completed.length : 0;

  const byService = {};
  completed.forEach(o => {
    if (!byService[o.serviceName]) byService[o.serviceName] = { count:0, revenue:0 };
    byService[o.serviceName].count++;
    byService[o.serviceName].revenue += o.amount;
  });

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0,7);
    const rev = completed.filter(o => o.dateIn?.startsWith(key)).reduce((s,o) => s+o.amount, 0);
    months.push({ label: d.toLocaleDateString('en-PH', { month:'short' }), rev });
  }
  const maxM = Math.max(...months.map(m => m.rev), 1);

  const custSpend = {};
  completed.forEach(o => { custSpend[o.customerName] = (custSpend[o.customerName]||0) + o.amount; });
  const topCust = Object.entries(custSpend).sort((a,b) => b[1]-a[1]).slice(0,5);

  return (
    <div className="page active" id="page-reports">
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[
          { accent:'var(--warning)',       icon:'💰', iconBg:'rgba(255,215,0,0.1)',   value:fmt(totalRevenue), label:'Total Revenue' },
          { accent:'var(--accent-cyan)',   icon:'✅', iconBg:'rgba(0,212,255,0.1)',  value:completed.length,  label:'Completed Orders' },
          { accent:'var(--success)',       icon:'📊', iconBg:'rgba(0,255,136,0.1)',  value:fmt(avgOrder),     label:'Avg Order Value' },
          { accent:'var(--accent-purple)', icon:'📈', iconBg:'rgba(124,58,237,0.1)', value:`${((completed.length/Math.max(orders.length,1))*100).toFixed(0)}%`, label:'Completion Rate' }
        ].map(s => (
          <div key={s.label} className="stat-card" style={{'--card-accent':s.accent}}>
            <div className="stat-header"><div className="stat-icon" style={{background:s.iconBg}}>{s.icon}</div></div>
            <div className="stat-value" style={{fontSize:'20px'}}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header"><div className="card-title">📊 Monthly Revenue</div></div>
          <div className="card-body">
            <div className="chart-container">
              {months.map(m => (
                <div key={m.label} className="chart-bar-group">
                  <div className="chart-bar" data-value={fmt(m.rev)}
                    style={{height:`${maxM>0?Math.max((m.rev/maxM)*180,4):4}px`,background:'linear-gradient(180deg,var(--accent-teal),var(--accent-cyan))'}} />
                  <div className="chart-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">🏆 Top Customers</div></div>
          <div className="card-body">
            {topCust.length === 0
              ? <div className="text-muted text-sm">No data yet.</div>
              : topCust.map(([name, amt], i) => (
                <div key={name} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'14px'}}>
                  <div style={{width:'24px',height:'24px',borderRadius:'50%',background:'linear-gradient(135deg,var(--accent-cyan),var(--accent-teal))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#000'}}>{i+1}</div>
                  <div style={{flex:1}}><div style={{fontSize:'13px',fontWeight:600}}>{name}</div></div>
                  <div className="text-warning fw-600">{fmt(amt)}</div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">⚙️ Revenue by Service</div></div>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Service</th><th>Orders</th><th>Revenue</th><th>Share</th></tr></thead>
            <tbody>
              {Object.entries(byService).length === 0
                ? <tr><td colSpan={4} className="text-center text-muted">No data</td></tr>
                : Object.entries(byService).sort((a,b)=>b[1].revenue-a[1].revenue).map(([svc,data]) => (
                  <tr key={svc}>
                    <td className="fw-600">{svc}</td>
                    <td>{data.count}</td>
                    <td className="text-warning fw-600">{fmt(data.revenue)}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <div style={{flex:1,background:'rgba(0,212,255,0.06)',borderRadius:'4px',height:'6px',overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${totalRevenue>0?(data.revenue/totalRevenue*100).toFixed(1):0}%`,background:'linear-gradient(90deg,var(--accent-cyan),var(--accent-teal))'}} />
                        </div>
                        <span style={{fontSize:'12px',minWidth:'36px'}}>{totalRevenue>0?(data.revenue/totalRevenue*100).toFixed(1):0}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
