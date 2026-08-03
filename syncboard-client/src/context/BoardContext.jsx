import React, { createContext, useState, useEffect } from 'react';

export const BoardContext = createContext();

const DEFAULT_BOARDS = [
  {
    id: 'board-1',
    name: 'SyncBoard UI Project',
    tasks: [
      {
        id: 'task-1',
        title: 'Design Glassmorphism Login Page',
        description: 'Create a sleek login form using CSS glassmorphism.',
        status: 'In Progress',
        priority: 'Medium',
        assignee: 'Member 2',
        history: []
      },
      {
        id: 'task-2',
        title: 'Implement Board Context & State Engine',
        description: 'Setup global React context and localStorage syncing.',
        status: 'Done',
        priority: 'High',
        assignee: 'Senumi (Lead)',
        history: []
      },
      {
        id: 'task-3',
        title: 'Develop Sidebar Navigation',
        description: 'Build collapsible navigation sidebar that lists boards.',
        status: 'Not Started',
        priority: 'Low',
        assignee: 'Member 6',
        history: []
      }
    ]
  }
];

export const BoardProvider = ({ children }) => {
  const [boards, setBoards] = useState(() => {
    const saved = localStorage.getItem('syncboard_data');
    return saved ? JSON.parse(saved) : DEFAULT_BOARDS;
  });

  const [activeBoardId, setActiveBoardId] = useState(() => {
    const savedActive = localStorage.getItem('syncboard_active_id');
    return savedActive || (boards.length > 0 ? boards[0].id : null);
  });

  const [isOffline, setIsOffline] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);

  // Save to local storage automatically
  useEffect(() => {
    localStorage.setItem('syncboard_data', JSON.stringify(boards));
    if (activeBoardId) {
      localStorage.setItem('syncboard_active_id', activeBoardId);
    }
  }, [boards, activeBoardId]);

  // Helper to format date and time
  const getFormattedDateTime = () => {
    return new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Add items to activity log
  const addLog = (message) => {
    const newLog = {
      id: Date.now().toString(),
      text: message,
      timestamp: getFormattedDateTime()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // 1. Board Actions (create/delete)
  const createBoard = (name) => {
    if (!name.trim()) return;
    const newBoard = {
      id: 'board-' + Date.now(),
      name: name.trim(),
      tasks: []
    };
    setBoards(prev => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
    addLog(`Created board "${newBoard.name}"`);
  };

  const deleteBoard = (boardId) => {
    const updatedBoards = boards.filter(b => b.id !== boardId);
    setBoards(updatedBoards);
    if (activeBoardId === boardId) {
      setActiveBoardId(updatedBoards.length > 0 ? updatedBoards[0].id : null);
    }
    addLog('Deleted a board');
  };

  // 2. Task Actions
  const addTask = (boardId, taskDetails) => {
    const newTask = {
      id: 'task-' + Date.now(),
      title: taskDetails.title || 'Untitled Task',
      description: taskDetails.description || '',
      status: taskDetails.status || 'Not Started',
      priority: taskDetails.priority || 'Medium',
      assignee: taskDetails.assignee || 'Unassigned',
      dueDate: taskDetails.dueDate || '',
      history: [{ text: 'Task created', timestamp: getFormattedDateTime() }]
    };

    setBoards(prev => prev.map(board => {
      if (board.id !== boardId) return board;
      return { ...board, tasks: [...board.tasks, newTask] };
    }));
    addLog(`Added task "${newTask.title}"`);
  };

    const moveTask = (boardId, taskId, newStatus, actorName = 'User') => {
    const timestamp = getFormattedDateTime();
    setBoards(prev => prev.map(board => {
      if (board.id !== boardId) return board;
      return {
        ...board,
        tasks: board.tasks.map(task => {
          if (task.id !== taskId) return task;
          const oldStatus = task.status;
          return {
            ...task,
            status: newStatus,
            history: [
              ...(task.history || []), // <-- SAFETY CHECK ADDED HERE
              { text: `Moved to ${newStatus} by ${actorName}`, timestamp }
            ]
          };
        })
      };
    }));

    // Find task title to write to activity log
    const board = boards.find(b => b.id === boardId);
    const task = board?.tasks.find(t => t.id === taskId);
    if (task) {
      addLog(`"${task.title}" moved to ${newStatus}`);
    }
  };

  const toggleConnection = () => {
    setIsOffline(prev => {
      const next = !prev;
      addLog(next ? 'System went offline' : 'System back online & synced');
      return next;
    });
  };

  const activeBoard = boards.find(b => b.id === activeBoardId) || null;

  return (
    <BoardContext.Provider value={{
      boards,
      activeBoard,
      activeBoardId,
      setActiveBoardId,
      isOffline,
      toggleConnection,
      createBoard,
      deleteBoard,
      addTask,
      moveTask,
      activityLogs
    }}>
      {children}
    </BoardContext.Provider>
  );
};