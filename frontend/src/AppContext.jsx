import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isCpMode, setIsCpMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  // Automatically update isCpMode on screen resize unless manually overridden
  useEffect(() => {
    function handleResize() {
      // If screen is resized to/from mobile, update cpMode
      if (window.innerWidth <= 768) {
        setIsCpMode(true);
      } else {
        setIsCpMode(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function toggleCpMode() {
    setIsCpMode(prev => !prev);
  }

  function toast(type, title, msg, dur = 4000) {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), dur);
  }

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      toasts,
      setToasts,
      toast,
      isCpMode,
      setIsCpMode,
      toggleCpMode
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
