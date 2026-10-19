import { useState, useEffect } from 'react';

export default function AndroidStatusBar() {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    }
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="android-status-bar" aria-hidden="true">
      <div className="status-bar-left">
        <span className="status-bar-time">{timeStr || '9:41'}</span>
        <span className="status-bar-app-icon">🧺</span>
      </div>
      <div className="status-bar-camera-notch">
        <div className="camera-lens" />
      </div>
      <div className="status-bar-right">
        <span className="status-bar-icon" title="5G Network">5G</span>
        <svg className="status-bar-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.5c3.5 0 6.74 1.34 9.17 3.54L12 19.33 2.83 11.04C5.26 8.84 8.5 7.5 12 7.5z"/>
        </svg>
        <span className="battery-badge">
          <span className="battery-level">98%</span>
          <span className="battery-body">
            <span className="battery-fill" style={{ width: '92%' }} />
          </span>
        </span>
      </div>
    </div>
  );
}
