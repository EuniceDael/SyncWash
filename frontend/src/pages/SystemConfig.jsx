import { useState } from 'react';
import { DB } from '../db';
import { useApp } from '../AppContext';

function Toggle({ id, label, desc, checked, onChange }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'14px 0',borderBottom:'1px solid rgba(0,212,255,0.06)'}}>
      <div>
        <div style={{fontSize:'14px',fontWeight:600,marginBottom:'2px'}}>{label}</div>
        <div style={{fontSize:'12px',color:'var(--text-muted)'}}>{desc}</div>
      </div>
      <label style={{position:'relative',cursor:'pointer',flexShrink:0,marginLeft:'16px'}}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
          style={{opacity:0,width:0,height:0,position:'absolute'}} />
        <div style={{width:'44px',height:'24px',borderRadius:'12px',background:checked?'var(--accent-cyan)':'rgba(0,212,255,0.1)',
          border:`1px solid ${checked?'var(--accent-cyan)':'var(--border-color)'}`,position:'relative',transition:'all 0.3s',cursor:'pointer'}}
          onClick={() => onChange(!checked)}>
          <div style={{position:'absolute',top:'2px',left:checked?'20px':'2px',width:'18px',height:'18px',borderRadius:'50%',
            background:'#fff',transition:'left 0.3s',boxShadow:'0 2px 4px rgba(0,0,0,0.3)'}} />
        </div>
      </label>
    </div>
  );
}

export default function SystemConfig() {
  const { toast } = useApp();
  const def = { shopName:'SmartLaundry',address:'123 Main St, Manila',phone:'09171234567',email:'info@smartlaundry.com',openTime:'07:00',closeTime:'21:00',smsEnabled:true,autoSmsOnReady:true,notifyOnNewOrder:false };
  const saved = DB.getObj('config', def);

  const [shopName,  setShopName]  = useState(saved.shopName);
  const [address,   setAddress]   = useState(saved.address);
  const [phone,     setPhone]     = useState(saved.phone);
  const [email,     setEmail]     = useState(saved.email);
  const [openTime,  setOpenTime]  = useState(saved.openTime);
  const [closeTime, setCloseTime] = useState(saved.closeTime);
  const [smsEnabled,      setSmsEnabled]      = useState(saved.smsEnabled);
  const [autoSmsOnReady,  setAutoSmsOnReady]  = useState(saved.autoSmsOnReady);
  const [notifyOnNewOrder,setNotifyOnNewOrder]= useState(saved.notifyOnNewOrder);

  function saveShop() { DB.setObj('config', { ...DB.getObj('config',def), shopName, address, phone, email, openTime, closeTime }); toast('success','Saved','Shop information updated.'); }
  function saveSms()  { DB.setObj('config', { ...DB.getObj('config',def), smsEnabled, autoSmsOnReady, notifyOnNewOrder }); toast('success','Saved','SMS settings updated.'); }
  function exportData() {
    const data = { users:DB.get('users'), orders:DB.get('orders'), services:DB.get('services'), smsLogs:DB.get('smsLogs') };
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    a.download = 'laundry_data_' + new Date().toISOString().split('T')[0] + '.json'; a.click();
  }
  function resetData() {
    if (!confirm('Reset to demo data?')) return;
    localStorage.removeItem('laundry_seeded_v1');
    import('../db').then(m => { m.seedData(); toast('success','Reset Done','Demo data restored.'); });
  }

  return (
    <div className="page active" id="page-system">
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">🏪 Shop Information</div></div>
          <div className="card-body">
            {[['Shop Name','text',shopName,setShopName],['Address','text',address,setAddress],
              ['Phone Number','text',phone,setPhone],['Email','email',email,setEmail]].map(([lbl,type,val,set]) => (
              <div key={lbl} className="form-group">
                <label>{lbl}</label>
                <input className="form-control" type={type} value={val} onChange={e=>set(e.target.value)} />
              </div>
            ))}
            <div className="form-row">
              <div className="form-group"><label>Opening Time</label><input className="form-control" type="time" value={openTime} onChange={e=>setOpenTime(e.target.value)} /></div>
              <div className="form-group"><label>Closing Time</label><input className="form-control" type="time" value={closeTime} onChange={e=>setCloseTime(e.target.value)} /></div>
            </div>
            <button className="btn btn-primary" onClick={saveShop}>💾 Save Changes</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">📱 SMS Settings</div></div>
          <div className="card-body">
            <Toggle id="smsEnabled"      label="Enable SMS Notifications"    desc="Master toggle for all SMS"                    checked={smsEnabled}       onChange={setSmsEnabled} />
            <Toggle id="autoSms"         label="Auto-SMS when Order is Ready" desc="Automatically notify when status = Ready"    checked={autoSmsOnReady}   onChange={setAutoSmsOnReady} />
            <Toggle id="notifNew"        label="Notify on New Order"          desc="Send internal alert for new orders"           checked={notifyOnNewOrder} onChange={setNotifyOnNewOrder} />
            <div style={{marginTop:'20px'}}><button className="btn btn-primary" onClick={saveSms}>💾 Save SMS Settings</button></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">💾 Data Management</div></div>
          <div className="card-body">
            <p style={{fontSize:'13px',color:'var(--text-secondary)',marginBottom:'16px'}}>Export or manage system data. All data is stored locally in your browser.</p>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <button className="btn btn-secondary" onClick={exportData}>📤 Export All Data (JSON)</button>
              <button className="btn btn-warning btn-sm" onClick={resetData}>🔄 Reset Demo Data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
