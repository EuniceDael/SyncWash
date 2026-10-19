import { useState } from 'react';
import { DB, fmtDate, genId } from '../db';
import { useApp } from '../AppContext';
import { Badge, Modal, EmptyState } from '../components/UI';

function UserModal({ userId, onClose, onSaved, toast }) {
  const user = userId ? DB.get('users').find(u => u.id === userId) : null;
  const [name,   setName]   = useState(user?.name || '');
  const [email,  setEmail]  = useState(user?.email || '');
  const [phone,  setPhone]  = useState(user?.phone || '');
  const [role,   setRole]   = useState(user?.role || 'customer');
  const [pass,   setPass]   = useState('');
  const [status, setStatus] = useState(user?.status || 'active');

  function handleSave() {
    if (!name || !email || !phone) { toast('warning', 'Incomplete', 'Fill all required fields.'); return; }
    const users = DB.get('users');
    if (userId) {
      const idx = users.findIndex(u => u.id === userId);
      if (idx >= 0) { users[idx] = { ...users[idx], name, email, phone, role, status }; if (pass) users[idx].password = pass; }
    } else {
      if (!pass) { toast('warning', 'Password required', 'Set a password for the new user.'); return; }
      if (users.find(u => u.email === email)) { toast('error', 'Email taken', 'This email is already registered.'); return; }
      users.push({ id: genId('u'), name, email, phone, role, password: pass, status, created: new Date().toISOString().split('T')[0] });
    }
    DB.set('users', users);
    toast('success', userId ? 'User Updated' : 'User Created', `${name} saved.`);
    onSaved(); onClose();
  }

  return (
    <Modal title={userId ? '✏️ Edit User' : '➕ Add User'} onClose={onClose}
      footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>💾 Save User</button></>}>
      <div className="form-row">
        <div className="form-group"><label>Full Name</label><input className="form-control" type="text" value={name} onChange={e=>setName(e.target.value)} required /></div>
        <div className="form-group"><label>Email</label><input className="form-control" type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
        <div className="form-group"><label>Phone</label><input className="form-control" type="text" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="09XXXXXXXXX" required /></div>
        <div className="form-group">
          <label>Role</label>
          <select className="form-control" value={role} onChange={e=>setRole(e.target.value)}>
            {['admin','owner','staff','customer'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
          </select>
        </div>
        <div className="form-group full">
          <label>{userId ? 'New Password (leave blank to keep)' : 'Password'}</label>
          <input className="form-control" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder={userId ? 'Leave blank to keep current' : 'Enter password'} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select className="form-control" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="active">Active</option><option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

export default function Users() {
  const { currentUser, toast } = useApp();
  const [search, setSearch] = useState('');
  const [tick,   setTick]   = useState(0);
  const [editId, setEditId] = useState(undefined);
  const canManage = currentUser.role === 'admin';

  let users = DB.get('users');
  if (search) {
    const q = search.toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
  }

  function toggleStatus(userId) {
    const users = DB.get('users');
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      users[idx].status = users[idx].status === 'active' ? 'inactive' : 'active';
      DB.set('users', users);
      toast('info', 'Status Updated', `${users[idx].name} is now ${users[idx].status}.`);
      setTick(t => t+1);
    }
  }

  return (
    <div className="page active" id="page-users">
      <div className="filter-bar">
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {canManage && <button className="btn btn-primary btn-sm" onClick={() => setEditId(null)}>➕ Add User</button>}
      </div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">👥 Users <span style={{fontSize:'13px',color:'var(--text-muted)',fontWeight:400}}>({users.length})</span></div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th>{canManage && <th>Actions</th>}</tr></thead>
            <tbody>
              {users.length === 0
                ? <tr><td colSpan={7}><EmptyState icon="👤" text="No users found" /></td></tr>
                : users.map(u => (
                  <tr key={u.id}>
                    <td className="fw-600">{u.name}</td>
                    <td className="text-muted text-sm">{u.email}</td>
                    <td className="text-sm">{u.phone}</td>
                    <td><Badge status={u.role} /></td>
                    <td><Badge status={u.status} /></td>
                    <td className="text-sm text-muted">{fmtDate(u.created)}</td>
                    {canManage && (
                      <td>
                        <div style={{display:'flex',gap:'6px'}}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditId(u.id)}>✏️ Edit</button>
                          {u.id !== currentUser.id && (
                            <button className="btn btn-danger btn-sm" onClick={() => toggleStatus(u.id)}>
                              {u.status === 'active' ? '🚫 Disable' : '✅ Enable'}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
      {editId !== undefined && (
        <UserModal userId={editId} onClose={() => setEditId(undefined)} onSaved={() => setTick(t=>t+1)} toast={toast} />
      )}
    </div>
  );
}
