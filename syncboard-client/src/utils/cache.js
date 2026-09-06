// Cache keys
const CACHE_KEYS = {
  BOARDS: 'syncboard_boards',
  TASKS: (boardId) => `syncboard_tasks_${boardId}`,
  USER: 'syncboard_user',
  LAST_SYNC: 'syncboard_last_sync'
};

// Generic cache functions
export const cache = {
  // Get data from cache
  get: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  },

  // Set data to cache
  set: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Cache write error:', error);
      return false;
    }
  },

  // Remove data from cache
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Cache remove error:', error);
      return false;
    }
  },

  // Clear all app cache
  clearAll: () => {
    try {
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith('syncboard_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  },

  // Get last sync timestamp
  getLastSync: () => {
    try {
      const timestamp = localStorage.getItem(CACHE_KEYS.LAST_SYNC);
      return timestamp ? new Date(Number(timestamp)) : null;
    } catch (error) {
      console.error('Last sync read error:', error);
      return null;
    }
  },

  // Update last sync timestamp
  updateLastSync: () => {
    try {
      localStorage.setItem(
        CACHE_KEYS.LAST_SYNC,
        Date.now().toString()
      );
      return true;
    } catch (error) {
      console.error('Last sync update error:', error);
      return false;
    }
  },

  // Check if cache is stale
  isStale: (key, maxAgeMinutes = 5) => {
    const data = cache.get(key);

    if (!data) {
      return true;
    }

    const lastSync = cache.getLastSync();

    if (!lastSync) {
      return true;
    }

    const now = new Date();
    const differenceInMinutes =
      (now.getTime() - lastSync.getTime()) / (1000 * 60);

    return differenceInMinutes > maxAgeMinutes;
  }
};

// Board cache functions
export const boardCache = {
  // Get all boards
  getAll: () => cache.get(CACHE_KEYS.BOARDS),

  // Save all boards
  saveAll: (boards) => {
    return cache.set(CACHE_KEYS.BOARDS, boards);
  },

  // Get one board by ID
  getById: (boardId) => {
    const boards = boardCache.getAll();

    if (!boards) {
      return null;
    }

    return boards.find((board) => board._id === boardId) || null;
  },

  // Add a board
  add: (board) => {
    const boards = boardCache.getAll() || [];
    const updatedBoards = [...boards, board];

    boardCache.saveAll(updatedBoards);
    return updatedBoards;
  },

  // Update a board
  update: (boardId, updates) => {
    const boards = boardCache.getAll() || [];

    const updatedBoards = boards.map((board) =>
      board._id === boardId
        ? { ...board, ...updates }
        : board
    );

    boardCache.saveAll(updatedBoards);
    return updatedBoards;
  },

  // Remove a board
  remove: (boardId) => {
    const boards = boardCache.getAll() || [];

    const updatedBoards = boards.filter(
      (board) => board._id !== boardId
    );

    boardCache.saveAll(updatedBoards);
    return updatedBoards;
  }
};

// Task cache functions
export const taskCache = {
  // Get tasks belonging to a board
  getByBoard: (boardId) => {
    const key = CACHE_KEYS.TASKS(boardId);
    return cache.get(key);
  },

  // Save tasks belonging to a board
  saveByBoard: (boardId, tasks) => {
    const key = CACHE_KEYS.TASKS(boardId);
    return cache.set(key, tasks);
  },

  // Add a task
  add: (boardId, task) => {
    const tasks = taskCache.getByBoard(boardId) || [];
    const updatedTasks = [...tasks, task];

    taskCache.saveByBoard(boardId, updatedTasks);
    return updatedTasks;
  },

  // Update a task
  update: (boardId, taskId, updates) => {
    const tasks = taskCache.getByBoard(boardId) || [];

    const updatedTasks = tasks.map((task) =>
      task._id === taskId
        ? { ...task, ...updates }
        : task
    );

    taskCache.saveByBoard(boardId, updatedTasks);
    return updatedTasks;
  },

  // Remove a task
  remove: (boardId, taskId) => {
    const tasks = taskCache.getByBoard(boardId) || [];

    const updatedTasks = tasks.filter(
      (task) => task._id !== taskId
    );

    taskCache.saveByBoard(boardId, updatedTasks);
    return updatedTasks;
  },

  // Clear all tasks belonging to a board
  clearBoard: (boardId) => {
    const key = CACHE_KEYS.TASKS(boardId);
    return cache.remove(key);
  }
};

// User cache functions
export const userCache = {
  getUser: () => cache.get(CACHE_KEYS.USER),

  saveUser: (user) => {
    return cache.set(CACHE_KEYS.USER, user);
  },

  clearUser: () => {
    return cache.remove(CACHE_KEYS.USER);
  }
};

export default cache;