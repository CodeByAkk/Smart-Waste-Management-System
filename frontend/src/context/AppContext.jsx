import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [role, setRole] = useState('ADMIN'); // 'ADMIN' | 'STAFF' | 'PUBLIC'
  const [alerts, setAlerts] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const refreshAll = () => setRefreshTrigger(prev => prev + 1);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 15000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts();
      if (Array.isArray(data)) {
        setAlerts(data);
      }
    } catch (_) {}
  };

  const markAllRead = async () => {
    try {
      await api.markAlertsAsRead();
      setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    } catch (_) {}
  };

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      alerts,
      unreadAlertsCount,
      markAllRead,
      refreshTrigger,
      refreshAll,
      showToast
    }}>
      {children}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white font-medium text-sm transition-all transform animate-bounce duration-300"
          style={{
            backgroundColor: toastMessage.type === 'danger' ? '#ef4444' :
                             toastMessage.type === 'warning' ? '#f59e0b' : '#15803d'
          }}>
          <span>{toastMessage.message}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 font-bold text-white/80 hover:text-white">✕</button>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
