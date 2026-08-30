import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import {
  boardCache,
  taskCache,
  userCache,
  cache
} from '../utils/cache';

const CacheContext = createContext();

export const useCache = () => {
  const context = useContext(CacheContext);

  if (!context) {
    throw new Error(
      'useCache must be used within CacheProvider'
    );
  }

  return context;
};

export const CacheProvider = ({ children }) => {
  const [isOffline, setIsOffline] = useState(
    !navigator.onLine
  );

  const [isSyncing, setIsSyncing] = useState(false);

  const [lastSync, setLastSync] = useState(
    cache.getLastSync()
  );

  // Listen for browser online and offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener(
        'offline',
        handleOffline
      );
    };
  }, []);

  const updateLastSync = () => {
    cache.updateLastSync();
    setLastSync(cache.getLastSync());
  };

  const value = {
    isOffline,
    isSyncing,
    setIsSyncing,
    lastSync,
    setLastSync: updateLastSync,
    boardCache,
    taskCache,
    userCache,
    cache
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};

export default CacheContext;