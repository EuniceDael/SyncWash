import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { seedData, DB } from './db';
import LoginPage   from './pages/LoginPage';
import Dashboard   from './pages/Dashboard';
import Orders      from './pages/Orders';
import Users       from './pages/Users';
import Services    from './pages/Services';
import SMS         from './pages/SMS';
import Reports     from './pages/Reports';
import SystemConfig from './pages/SystemConfig';
import Track       from './pages/Track';
import MyOrders    from './pages/MyOrders';
import Profile     from './pages/Profile';
import NewOrder    from './pages/NewOrder';
import Sidebar     from './components/Sidebar';
import Topbar      from './components/Topbar';
import Toast       from './components/Toast';

// Android Cellphone Components
import AndroidStatusBar from './components/AndroidStatusBar';
import AndroidTopBar    from './components/AndroidTopBar';
import AndroidBottomNav from './components/AndroidBottomNav';

seedData();

function getDefaultPage(role) {
  if (role === 'customer') return 'track';
  if (role === 'staff')    return 'orders';
  return 'dashboard';
}

function MobileAndroidShell({ page, setPage, trackOrderId, setTrackId, smsBadge }) {
  const { toggleCpMode } = useApp();
  const [usePhoneFrame, setUsePhoneFrame] = useState(true);

  function navigateTo(pageId, orderId = null) {
    setPage(pageId);
    if (pageId === 'track' && orderId) setTrackId(orderId);
    else setTrackId(null);
  }

  const pageProps = { onNavigate: navigateTo };

  const content = (
    <div className="android-screen-wrapper">
      {/* 1. Android System Status Bar */}
      <AndroidStatusBar />

      {/* 2. Material Top App Bar */}
      <AndroidTopBar
        currentPage={page}
        onNavigate={navigateTo}
        smsBadge={smsBadge}
      />

      {/* 3. Scrollable Page Content */}
      <main className="android-content-area" id="androidScrollContainer">
        {page === 'orders'    && <Orders />}
        {page === 'track'     && <Track initOrderId={trackOrderId} />}
        {page === 'myorders'  && <MyOrders {...pageProps} />}
        {page === 'neworder'  && <NewOrder {...pageProps} />}
        {page === 'services'  && <Services {...pageProps} />}
        {page === 'sms'       && <SMS />}
        {page === 'profile'   && <Profile />}
        {page === 'dashboard' && <Dashboard {...pageProps} />}
        {page === 'users'     && <Users />}
        {page === 'reports'   && <Reports />}
        {page === 'system'    && <SystemConfig />}
      </main>

      {/* 4. Material 3 Bottom Navigation Bar */}
      <AndroidBottomNav
        currentPage={page}
        onNavigate={navigateTo}
        smsBadge={smsBadge}
      />
    </div>
  );

  return (
    <div className={`android-app-container ${usePhoneFrame ? 'with-phone-frame' : 'full-screen-mode'}`}>
      {/* Desktop Preview Controller Pill */}
      <div className="desktop-device-controls" title="Toggle between Phone Mockup and Full-Screen Mobile view">
        <span className="control-label">📱 CP Mode:</span>
        <button
          type="button"
          className={`device-btn ${usePhoneFrame ? 'active' : ''}`}
          onClick={() => setUsePhoneFrame(true)}
        >
          Phone Frame
        </button>
        <button
          type="button"
          className={`device-btn ${!usePhoneFrame ? 'active' : ''}`}
          onClick={() => setUsePhoneFrame(false)}
        >
          Full View
        </button>
        <button
          type="button"
          className="device-btn"
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
          onClick={toggleCpMode}
        >
          🖥️ Back to Desktop UI
        </button>
      </div>

      {usePhoneFrame ? (
        <div className="android-device-bezel">
          <div className="android-device-speaker" />
          <div className="android-device-screen">
            {content}
          </div>
        </div>
      ) : (
        <div className="android-full-wrapper">
          {content}
        </div>
      )}
    </div>
  );
}

function DesktopShell({ page, setPage, trackOrderId, setTrackId, smsBadge }) {
  function navigateTo(pageId, orderId = null) {
    setPage(pageId);
    if (pageId === 'track' && orderId) setTrackId(orderId);
    else setTrackId(null);
  }

  const pageProps = { onNavigate: navigateTo };

  return (
    <div id="app" className="visible">
      <Sidebar currentPage={page} onNavigate={navigateTo} smsBadge={smsBadge} />
      <div className="main-content">
        <Topbar currentPage={page} />
        <div className="page-wrapper">
          {page === 'dashboard' && <Dashboard {...pageProps} />}
          {page === 'orders'    && <Orders />}
          {page === 'users'     && <Users />}
          {page === 'services'  && <Services {...pageProps} />}
          {page === 'sms'       && <SMS />}
          {page === 'reports'   && <Reports />}
          {page === 'system'    && <SystemConfig />}
          {page === 'track'     && <Track initOrderId={trackOrderId} />}
          {page === 'myorders'  && <MyOrders {...pageProps} />}
          {page === 'neworder'  && <NewOrder {...pageProps} />}
          {page === 'profile'   && <Profile />}
        </div>
      </div>
    </div>
  );
}

function AppShell() {
  const { currentUser, isCpMode } = useApp();
  const [page, setPage]           = useState(null);
  const [trackOrderId, setTrackId] = useState(null);

  useEffect(() => {
    if (currentUser) setPage(getDefaultPage(currentUser.role));
  }, [currentUser]);

  const smsBadge = DB.get('smsLogs').filter(l => l.status === 'failed').length;

  if (!currentUser) return <LoginPage />;

  // If using cellphone ("cp") mode (either actual mobile screen <= 768px, or toggled on desktop):
  // Both Staff and Customer see the cellphone (cp) UI/UX!
  // When on desktop, Staff and Customer see the ORIGINAL UI/UX!
  const showCpView = isCpMode && (currentUser.role === 'staff' || currentUser.role === 'customer');

  return (
    <>
      {showCpView ? (
        <MobileAndroidShell
          page={page}
          setPage={setPage}
          trackOrderId={trackOrderId}
          setTrackId={setTrackId}
          smsBadge={smsBadge}
        />
      ) : (
        <DesktopShell
          page={page}
          setPage={setPage}
          trackOrderId={trackOrderId}
          setTrackId={setTrackId}
          smsBadge={smsBadge}
        />
      )}
      <div className="bg-grid" />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
