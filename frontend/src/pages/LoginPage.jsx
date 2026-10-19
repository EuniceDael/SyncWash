import { useState } from 'react';
import { DB, genId } from '../db';
import { useApp } from '../AppContext';

const DEMOS = {
  admin:    { email: 'admin@laundry.com',    pass: 'admin123' },
  owner:    { email: 'owner@laundry.com',    pass: 'owner123' },
  staff:    { email: 'staff@laundry.com',    pass: 'staff123' },
  customer: { email: 'customer@laundry.com', pass: 'cust123'  }
};

const ROLES = [
  { id: 'admin',    icon: '🔧', label: 'Admin' },
  { id: 'owner',    icon: '👔', label: 'Owner' },
  { id: 'staff',    icon: '🧑‍💼', label: 'Staff' },
  { id: 'customer', icon: '🙋', label: 'Customer' }
];

function StrengthBar({ pass }) {
  if (!pass) return null;
  const len = pass.length;
  const width  = len >= 10 ? '100%' : len >= 8 ? '66%' : len >= 6 ? '33%' : '15%';
  const color  = len >= 10 ? '#00c853' : len >= 8 ? '#ffab40' : len >= 6 ? '#ffca28' : '#ef5350';
  const label  = len >= 10 ? 'Strong 💪' : len >= 8 ? 'Good 👍' : len >= 6 ? 'Fair ⚠️' : 'Weak ❌';
  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width, background: color, borderRadius: '4px', transition: 'all 0.3s' }} />
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Strength: {label}</div>
    </div>
  );
}

function RegisterView({ onBack, toast, prefillLogin }) {
  const [rName,    setRName]    = useState('');
  const [rEmail,   setREmail]   = useState('');
  const [rPhone,   setRPhone]   = useState('');
  const [rPass,    setRPass]    = useState('');
  const [rConfirm, setRConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const passwordsMatch = rConfirm.length > 0 && rPass === rConfirm;
  const passwordsMismatch = rConfirm.length > 0 && rPass !== rConfirm;

  function handleRegister(e) {
    e.preventDefault();
    if (rPass !== rConfirm) { toast('error', 'Password Mismatch', 'Passwords do not match.'); return; }
    if (rPass.length < 6)   { toast('error', 'Weak Password', 'Password must be at least 6 characters.'); return; }

    const users = DB.get('users');
    if (users.find(u => u.email === rEmail.trim().toLowerCase())) {
      toast('error', 'Email Taken', 'An account with this email already exists.');
      return;
    }

    const newUser = {
      id:       genId('u'),
      name:     rName.trim(),
      email:    rEmail.trim().toLowerCase(),
      phone:    rPhone.trim(),
      role:     'customer',
      password: rPass,
      status:   'active',
      created:  new Date().toISOString().split('T')[0]
    };

    DB.set('users', [...users, newUser]);
    toast('success', 'Account Created! 🎉', `Welcome, ${newUser.name}! You can now sign in.`);
    prefillLogin(newUser.email, newUser.password);
    onBack();
  }

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle} style={{
      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px',
      color: 'var(--text-muted)', padding: 0
    }}>{show ? '🙈' : '👁️'}</button>
  );

  return (
    <div id="loginPage">
      <div className="login-container">
        <div className="login-logo">
          <div className="logo-icon">🧺</div>
          <h1>SMARTLAUNDRY</h1>
          <p>Management System</p>
        </div>

        <div className="login-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <button onClick={onBack} style={{
              background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)',
              borderRadius: '8px', color: 'var(--accent-cyan)', cursor: 'pointer',
              fontSize: '16px', padding: '4px 10px', lineHeight: 1
            }} title="Back to Sign In">←</button>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Create Customer Account</h2>
          </div>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-group">
                <span className="input-icon">👤</span>
                <input className="form-control" type="text" value={rName}
                  onChange={e => setRName(e.target.value)} placeholder="Enter your full name" required />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-group">
                <span className="input-icon">✉️</span>
                <input className="form-control" type="email" value={rEmail}
                  onChange={e => setREmail(e.target.value)} placeholder="Enter your email" required />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number (for SMS Alerts)</label>
              <div className="input-group">
                <span className="input-icon">📱</span>
                <input className="form-control" type="tel" value={rPhone}
                  onChange={e => setRPhone(e.target.value)}
                  placeholder="e.g. 09171234567"
                  required />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-group" style={{ position: 'relative' }}>
                <span className="input-icon">🔒</span>
                <input className="form-control" type={showPass ? 'text' : 'password'} value={rPass}
                  onChange={e => setRPass(e.target.value)} placeholder="Min. 6 characters"
                  required style={{ paddingRight: '42px' }} />
                {eyeBtn(showPass, () => setShowPass(v => !v))}
              </div>
              <StrengthBar pass={rPass} />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-group" style={{ position: 'relative' }}>
                <span className="input-icon">🔑</span>
                <input className="form-control" type={showConf ? 'text' : 'password'} value={rConfirm}
                  onChange={e => setRConfirm(e.target.value)} placeholder="Re-enter password"
                  required style={{ paddingRight: '42px' }} />
                {eyeBtn(showConf, () => setShowConf(v => !v))}
              </div>
              {passwordsMismatch && <div style={{ fontSize: '11px', color: '#ef5350', marginTop: '4px' }}>❌ Passwords do not match</div>}
              {passwordsMatch   && <div style={{ fontSize: '11px', color: '#00c853', marginTop: '4px' }}>✅ Passwords match</div>}
            </div>

            <button className="btn btn-primary btn-login" type="submit" id="registerBtn">
              🙋 CREATE ACCOUNT
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <span onClick={onBack} style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }}>Sign In</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { setCurrentUser, toast, isCpMode } = useApp();
  const [role,     setRole]     = useState('admin');
  const [email,    setEmail]    = useState('admin@laundry.com');
  const [password, setPassword] = useState('admin123');
  const [view,     setView]     = useState('login');

  function selectRole(r) {
    setRole(r);
    setEmail(DEMOS[r].email);
    setPassword(DEMOS[r].pass);
  }

  function quickLogin(targetRole) {
    const creds = DEMOS[targetRole];
    const users = DB.get('users');
    const user = users.find(u => u.email === creds.email && u.role === targetRole);
    if (user) {
      setCurrentUser(user);
      toast('success', `Welcome ${user.name}!`, `Logged in as ${targetRole.toUpperCase()}`);
    } else {
      selectRole(targetRole);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    const users = DB.get('users');
    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    if (!user) { toast('error', 'Login Failed', 'Invalid credentials.'); return; }
    if (user.status === 'inactive') { toast('error', 'Account Disabled', 'Your account has been deactivated.'); return; }
    setCurrentUser(user);
    toast('success', 'Welcome back!', `Logged in as ${user.name}`);
  }

  function prefillLogin(e, p) {
    setRole('customer');
    setEmail(e);
    setPassword(p);
  }

  if (view === 'register') {
    return <RegisterView onBack={() => setView('login')} toast={toast} prefillLogin={prefillLogin} />;
  }

  return (
    <div id="loginPage">
      <div className="login-container">
        <div className="login-logo">
          <div className="logo-icon">🧺</div>
          <h1>SMARTLAUNDRY</h1>
          <p>Management System</p>
        </div>

        <div className="login-card">
          <h2>Sign In to Your Account</h2>

          {/* If on Cellphone (CP), show quick 1-tap buttons */}
          {isCpMode && (
            <div className="mobile-quick-access-box">
              <div className="quick-access-title">⚡ 1-Tap Quick CP Login:</div>
              <div className="quick-access-buttons">
                <button
                  type="button"
                  className="btn-quick-role staff-quick"
                  onClick={() => quickLogin('staff')}
                >
                  <span className="quick-icon">🧑‍💼</span>
                  <div className="quick-text">
                    <strong>Maria Staff</strong>
                    <span>Laundry Operations</span>
                  </div>
                  <span className="quick-arrow">→</span>
                </button>
                <button
                  type="button"
                  className="btn-quick-role customer-quick"
                  onClick={() => quickLogin('customer')}
                >
                  <span className="quick-icon">🙋</span>
                  <div className="quick-text">
                    <strong>Ana Customer</strong>
                    <span>Track & Book Laundry</span>
                  </div>
                  <span className="quick-arrow">→</span>
                </button>
              </div>
            </div>
          )}

          <div className="role-selector">
            {ROLES.map(r => (
              <div key={r.id} className={`role-btn${role === r.id ? ' active' : ''}`} onClick={() => selectRole(r.id)}>
                <div className="role-icon">{r.icon}</div>
                <div className="role-name">{r.label}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-group">
                <span className="input-icon">✉️</span>
                <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
              </div>
            </div>

            <button className="btn btn-primary btn-login" type="submit" id="loginBtn">
              🚀 SIGN IN
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '13px', color: 'var(--text-muted)' }}>
            New customer?{' '}
            <span id="goToRegisterBtn" onClick={() => setView('register')}
              style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }}>
              Create an account
            </span>
          </div>

          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '10px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Demo Credentials</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              🔧 Admin: admin@laundry.com / admin123<br />
              👔 Owner: owner@laundry.com / owner123<br />
              🧑‍💼 Staff: staff@laundry.com / staff123<br />
              🙋 Customer: customer@laundry.com / cust123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
