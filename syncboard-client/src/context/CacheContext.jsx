import React, { createContext, useContext, useState } from 'react';

const CacheContext = createContext(null);

const getStoredData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Failed to read ${key} from cache:`, error);
    return [];
  }
};

const saveStoredData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to cache:`, error);
  }
};

export const CacheProvider = ({ children }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastSync, setLastSyncState] = useState(
    localStorage.getItem('lastSync')
  );

  const setLastSync = () => {
    const time = new Date().toISOString();
    localStorage.setItem('lastSync', time);
    setLastSyncState(time);
  };

  const boardCache = {
    getAll: () => {
      return getStoredData('boardCache');
    },

    saveAll: (boards) => {
      saveStoredData('boardCache', boards);
    },

    add: (board) => {
      const boards = getStoredData('boardCache');
      saveStoredData('boardCache', [...boards, board]);
    }
  };

  const taskCache = {
    getByBoard: (boardId) => {
      const tasks = getStoredData('taskCache');

      return tasks.filter(
        task => task.board === boardId || task.board?._id === boardId
      );
    },

    saveByBoard: (boardId, newTasks) => {
      const allTasks = getStoredData('taskCache');

      const otherTasks = allTasks.filter(
        task => task.board !== boardId && task.board?._id !== boardId
      );

      saveStoredData('taskCache', [...otherTasks, ...newTasks]);
    },

    add: (boardId, task) => {
      const tasks = getStoredData('taskCache');

      saveStoredData('taskCache', [
        ...tasks,
        {
          ...task,
          board: task.board || boardId
        }
      ]);
    }
  };

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <CacheContext.Provider
      value={{
        boardCache,
        taskCache,
        isOffline,
        lastSync,
        setLastSync
      }}
    >
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);

  if (!context) {
    throw new Error('useCache must be used inside CacheProvider');
  }

  return context;
};