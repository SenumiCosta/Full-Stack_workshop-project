import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import {
  boardCache,
  taskCache,
  orgCache,
  syncQueue,
  userCache,
  cache
} from '../utils/cache';

const CacheContext = createContext();

export const useCache = () => {
  const context = useContext(CacheContext);

  if (!context) {
    return {
      isOffline: false,
      isSyncing: false,
      pendingCount: 0,
      boardCache: { getAll: () => [], saveAll: () => {} },
      taskCache: { getByBoard: () => [], saveByBoard: () => {}, add: () => {}, update: () => {}, remove: () => {} },
      orgCache: { getAll: () => [], saveAll: () => {}, add: () => {} },
      syncQueue: { getQueue: () => [], enqueue: () => {}, dequeue: () => {}, clearQueue: () => {}, getPendingCount: () => 0 },
      userCache: {},
      setLastSync: () => {},
      toggleOfflineMode: () => {},
      syncOfflineChanges: async () => {}
    };
  }

  return context;
};

export const CacheProvider = ({ children }) => {
  const [isOffline, setIsOffline] = useState(
    !navigator.onLine
  );

  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(syncQueue.getPendingCount());

  const [lastSync, setLastSync] = useState(
    cache.getLastSync()
  );

  const refreshPendingCount = () => {
    setPendingCount(syncQueue.getPendingCount());
  };

  const toggleOfflineMode = () => {
    setIsOffline(prev => !prev);
  };

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
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateLastSync = () => {
    cache.updateLastSync();
    setLastSync(cache.getLastSync());
    refreshPendingCount();
  };

  // Replay all offline mutation operations against the REST API
  const syncOfflineChanges = async (apiClient, onComplete) => {
    const queue = syncQueue.getQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    const tempIdMap = {};

    for (const item of queue) {
      try {
        if (item.type === 'CREATE_BOARD') {
          const res = await apiClient.post('/boards', item.data);
          const serverBoard = res.data.data || res.data;
          tempIdMap[item.tempId] = serverBoard._id;

          const boards = boardCache.getAll() || [];
          const updatedBoards = boards.map(b => b._id === item.tempId ? serverBoard : b);
          boardCache.saveAll(updatedBoards);
        } else if (item.type === 'DELETE_BOARD') {
          const actualBoardId = tempIdMap[item.boardId] || item.boardId;
          if (!String(actualBoardId).startsWith('temp_')) {
            await apiClient.delete(`/boards/${actualBoardId}`);
          }
        } else if (item.type === 'CREATE_TASK') {
          const actualBoardId = tempIdMap[item.boardId] || item.boardId;
          const res = await apiClient.post(`/boards/${actualBoardId}/tasks`, item.data);
          const serverTask = res.data.data || res.data;
          tempIdMap[item.tempId] = serverTask._id;

          const tasks = taskCache.getByBoard(actualBoardId) || [];
          const updatedTasks = tasks.map(t => t._id === item.tempId ? serverTask : t);
          taskCache.saveByBoard(actualBoardId, updatedTasks);
        } else if (item.type === 'UPDATE_TASK') {
          const actualBoardId = tempIdMap[item.boardId] || item.boardId;
          const actualTaskId = tempIdMap[item.taskId] || item.taskId;
          if (!String(actualTaskId).startsWith('temp_')) {
            const res = await apiClient.put(`/tasks/${actualTaskId}`, item.data);
            const serverTask = res.data.data || res.data;
            taskCache.update(actualBoardId, actualTaskId, serverTask);
          }
        } else if (item.type === 'DELETE_TASK') {
          const actualBoardId = tempIdMap[item.boardId] || item.boardId;
          const actualTaskId = tempIdMap[item.taskId] || item.taskId;
          if (!String(actualTaskId).startsWith('temp_')) {
            await apiClient.delete(`/tasks/${actualTaskId}`);
          }
          taskCache.remove(actualBoardId, actualTaskId);
        }

        syncQueue.dequeue(item.id);
      } catch (err) {
        console.error('Offline queue sync error for item:', item, err);
        // On conflict (409) or bad request (400), dequeue to avoid infinite block
        if (err.isConflict || (err.response && [400, 404, 409].includes(err.response.status))) {
          syncQueue.dequeue(item.id);
        }
      }
    }

    cache.updateLastSync();
    setLastSync(cache.getLastSync());
    refreshPendingCount();
    setIsSyncing(false);
    if (onComplete) onComplete();
  };

  const value = {
    isOffline,
    toggleOfflineMode,
    isSyncing,
    setIsSyncing,
    pendingCount,
    refreshPendingCount,
    lastSync,
    setLastSync: updateLastSync,
    syncOfflineChanges,
    boardCache,
    taskCache,
    orgCache,
    syncQueue,
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
