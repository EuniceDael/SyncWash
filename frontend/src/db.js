// Data Store
export const DB = {
  get(key) { try { return JSON.parse(localStorage.getItem('laundry_' + key)) || []; } catch { return []; } },
  set(key, val) { localStorage.setItem('laundry_' + key, JSON.stringify(val)); },
  getObj(key, def = {}) { try { return JSON.parse(localStorage.getItem('laundry_' + key)) || def; } catch { return def; } },
  setObj(key, val) { localStorage.setItem('laundry_' + key, JSON.stringify(val)); }
};

export function genId(prefix) { return prefix + '-' + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase(); }
export function fmt(n) { return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
export function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }); }
export function fmtDateTime(d) { if (!d) return '—'; return new Date(d).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }

export function seedData() {
  if (localStorage.getItem('laundry_seeded_v1')) return;
  const users = [
    { id: 'u1', name: 'Admin User',   email: 'admin@laundry.com',    phone: '09171234567', role: 'admin',    password: 'admin123', status: 'active',   created: '2024-01-01' },
    { id: 'u2', name: 'John Owner',   email: 'owner@laundry.com',    phone: '09181234567', role: 'owner',    password: 'owner123', status: 'active',   created: '2024-01-02' },
    { id: 'u3', name: 'Maria Staff',  email: 'staff@laundry.com',    phone: '09191234567', role: 'staff',    password: 'staff123', status: 'active',   created: '2024-01-03' },
    { id: 'u4', name: 'Carlos Staff', email: 'staff2@laundry.com',   phone: '09201234567', role: 'staff',    password: 'staff123', status: 'active',   created: '2024-01-04' },
    { id: 'u5', name: 'Ana Customer', email: 'customer@laundry.com', phone: '09211234567', role: 'customer', password: 'cust123',  status: 'active',   created: '2024-01-05' },
    { id: 'u6', name: 'Pedro Santos', email: 'pedro@email.com',      phone: '09221234567', role: 'customer', password: 'cust123',  status: 'active',   created: '2024-02-01' },
    { id: 'u7', name: 'Rosa Cruz',    email: 'rosa@email.com',       phone: '09231234567', role: 'customer', password: 'cust123',  status: 'inactive', created: '2024-02-15' }
  ];
  const services = [
    { id: 's1', name: 'Wash & Fold',   price: 60,  unit: 'per kg',    minWeight: 3, description: 'Regular wash and fold service' },
    { id: 's2', name: 'Wash & Iron',   price: 80,  unit: 'per kg',    minWeight: 3, description: 'Wash and press/iron service' },
    { id: 's3', name: 'Dry Cleaning',  price: 150, unit: 'per piece', minWeight: 1, description: 'Professional dry cleaning' },
    { id: 's4', name: 'Express Wash',  price: 100, unit: 'per kg',    minWeight: 2, description: 'Same-day express service' },
    { id: 's5', name: 'Bedding',       price: 120, unit: 'per set',   minWeight: 1, description: 'Bedsheets, pillowcases, comforters' },
    { id: 's6', name: 'Sneaker Clean', price: 200, unit: 'per pair',  minWeight: 1, description: 'Deep clean for sneakers' }
  ];
  const now = new Date();
  const orders = [];
  const statuses = ['pending','washing','drying','folding','ready','completed'];
  const customers = users.filter(u => u.role === 'customer');
  for (let i = 1; i <= 28; i++) {
    const d = new Date(now); d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    const cust = customers[Math.floor(Math.random() * customers.length)];
    const svc  = services[Math.floor(Math.random() * services.length)];
    const qty  = +(Math.random() * 8 + 2).toFixed(1);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    orders.push({
      id: 'ORD-' + String(1000 + i), customerId: cust.id, customerName: cust.name, customerPhone: cust.phone,
      serviceId: svc.id, serviceName: svc.name, servicePrice: svc.price, quantity: qty, unit: svc.unit,
      amount: +(qty * svc.price).toFixed(2), status, staffId: 'u3', staffName: 'Maria Staff',
      dateIn: d.toISOString().split('T')[0],
      dateOut: status === 'completed' ? new Date(d.getTime() + 86400000 * 2).toISOString().split('T')[0] : null,
      notes: '', smsNotified: status === 'ready' || status === 'completed', created: d.toISOString()
    });
  }
  const smsLogs = [];
  orders.filter(o => o.smsNotified).forEach(o => {
    smsLogs.push({ id: 'SMS-' + smsLogs.length, orderId: o.id, phone: o.customerPhone, customerName: o.customerName,
      type: 'ready', message: `Hi ${o.customerName}, your laundry order ${o.id} is ready for pickup! Thank you for choosing SmartLaundry.`,
      status: Math.random() > 0.1 ? 'sent' : 'failed', timestamp: o.created });
  });
  DB.set('users', users); DB.set('services', services); DB.set('orders', orders); DB.set('smsLogs', smsLogs);
  localStorage.setItem('laundry_seeded_v1', '1');
}
