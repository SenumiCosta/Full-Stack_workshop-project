import React, { useState, useEffect } from 'react';
import { useCache } from '../context/CacheContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/apiClient';
import Sidebar from '../components/Sidebar/Sidebar';
import ActivityLog from '../components/Common/ActivityLog';
import CreateTaskModal from "../components/modals/CreateTaskModal";

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conflictData, setConflictData] = useState(null);

  const { taskCache, boardCache, isOffline, setLastSync } = useCache();
  const { socket, isConnected, connect, joinBoard, on, off } = useSocket();
  const token = localStorage.getItem('syncboard_token');

  useEffect(() => {
    if (token && !socket) {
      connect(token);
    }
  }, [token]);

  useEffect(() => {
    if (activeBoardId && isConnected) {
      joinBoard(activeBoardId);
    }
  }, [activeBoardId, isConnected]);

  useEffect(() => {
    const loadBoards = async () => {
      setIsLoading(true);
      const cachedBoards = boardCache.getAll();
      if (cachedBoards && cachedBoards.length > 0) {
        setBoards(cachedBoards);
        if (!activeBoardId) {
          setActiveBoardId(cachedBoards[0]._id);
        }
      }
      if (!isOffline) {
        try {
          const res = await api.get('/boards');
          const freshBoards = res.data.data || res.data;
          setBoards(freshBoards);
          boardCache.saveAll(freshBoards);
          setLastSync();
          if (!activeBoardId && freshBoards.length > 0) {
            setActiveBoardId(freshBoards[0]._id);
          }
        } catch (err) {
          console.error('Failed to fetch boards:', err);
        }
      }
      setIsLoading(false);
    };
    loadBoards();
  }, []);

  useEffect(() => {
    if (!activeBoardId) return;
    const loadTasks = async () => {
      setIsLoading(true);
      const cachedTasks = taskCache.getByBoard(activeBoardId);
      if (cachedTasks && cachedTasks.length > 0) {
        setTasks(cachedTasks);
      }
      if (!isOffline) {
        try {
          const res = await api.get(`/boards/${activeBoardId}/tasks`);
          const freshTasks = res.data.data || res.data;
          setTasks(freshTasks);
          taskCache.saveByBoard(activeBoardId, freshTasks);
          setLastSync();
        } catch (err) {
          console.error('Failed to fetch tasks:', err);
        }
      }
      setIsLoading(false);
    };
    loadTasks();
  }, [activeBoardId]);

  useEffect(() => {
    if (!socket || !activeBoardId) return;
    const handleTaskCreated = (newTask) => {
      console.log('📝 Task created:', newTask);
      setTasks(prev => {
        if (prev.some(t => t._id === newTask._id)) return prev;
        return [...prev, newTask];
      });
      taskCache.add(activeBoardId, newTask);
    };
    const handleTaskUpdated = (updatedTask) => {
      console.log('🔄 Task updated:', updatedTask);
      setTasks(prev => {
        const exists = prev.some(t => t._id === updatedTask._id);
        if (!exists) return [...prev, updatedTask];
        return prev.map(t => t._id === updatedTask._id ? updatedTask : t);
      });
      taskCache.update(activeBoardId, updatedTask._id, updatedTask);
    };
    const handleTaskDeleted = (taskId) => {
      console.log('🗑️ Task deleted:', taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      taskCache.remove(activeBoardId, taskId);
    };
    on('task-created', handleTaskCreated);
    on('task-updated', handleTaskUpdated);
    on('task-deleted', handleTaskDeleted);
    return () => {
      off('task-created', handleTaskCreated);
      off('task-updated', handleTaskUpdated);
      off('task-deleted', handleTaskDeleted);
    };
  }, [socket, activeBoardId, on, off]);

  const handleTaskCreatedLocal = async (newTask) => {
    const tempTask = {
      ...newTask,
      _id: `temp_${Date.now()}`,
      history: [{ text: 'Task created', timestamp: new Date().toISOString() }]
    };
    setTasks([...tasks, tempTask]);
    taskCache.add(activeBoardId, tempTask);
    if (isOffline) {
      alert('Task saved offline. Will sync when online.');
      return;
    }
    try {
      const res = await api.post(`/boards/${activeBoardId}/tasks`, newTask);
      const createdTask = res.data.data || res.data;
      const updatedTasks = tasks.filter(t => t._id !== tempTask._id).concat(createdTask);
      setTasks(updatedTasks);
      taskCache.saveByBoard(activeBoardId, updatedTasks);
      setLastSync();
    } catch (err) {
      console.error('Failed to create task:', err);
      const updatedTasks = tasks.filter(t => t._id !== tempTask._id);
      setTasks(updatedTasks);
      taskCache.saveByBoard(activeBoardId, updatedTasks);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    const oldTask = tasks.find(t => t._id === taskId);
    if (!oldTask) return;
    const updatedTasks = tasks.map(t => t._id === taskId ? { ...t, ...updates } : t);
    setTasks(updatedTasks);
    taskCache.saveByBoard(activeBoardId, updatedTasks);
    if (isOffline) {
      alert('Task updated offline. Will sync when online.');
      return;
    }
    try {
      const updatesWithTimestamp = { ...updates, _clientUpdatedAt: oldTask.updatedAt };
      const res = await api.put(`/tasks/${taskId}`, updatesWithTimestamp);
      const finalTasks = tasks.map(t => t._id === taskId ? res.data.data : t);
      setTasks(finalTasks);
      taskCache.saveByBoard(activeBoardId, finalTasks);
      setLastSync();
    } catch (err) {
      if (err.isConflict) {
        setConflictData({
          clientData: { ...oldTask, ...updates },
          serverData: err.serverData
        });
      } else {
        console.error('Failed to update task:', err);
        setTasks(tasks);
        taskCache.saveByBoard(activeBoardId, tasks);
        alert('Failed to update task. Please try again.');
      }
    }
  };

  const handleConflictResolve = async (mergedData) => {
    try {
      const res = await api.put(`/tasks/${mergedData._id}`, mergedData);
      const finalTasks = tasks.map(t => t._id === mergedData._id ? res.data.data : t);
      setTasks(finalTasks);
      taskCache.saveByBoard(activeBoardId, finalTasks);
      setLastSync();
      setConflictData(null);
    } catch (err) {
      console.error('Failed to resolve conflict:', err);
      alert('Failed to resolve conflict. Please try again.');
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    const updatedTasks = tasks.filter(t => t._id !== taskId);
    setTasks(updatedTasks);
    taskCache.saveByBoard(activeBoardId, updatedTasks);
    if (isOffline) {
      alert('Task deleted offline. Will sync when online.');
      return;
    }
    try {
      await api.delete(`/tasks/${taskId}`);
      setLastSync();
    } catch (err) {
      console.error('Failed to delete task:', err);
      setTasks(tasks);
      taskCache.saveByBoard(activeBoardId, tasks);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleBoardSelect = (boardId) => {
    setActiveBoardId(boardId);
  };

  const currentBoard = boards.find(b => b._id === activeBoardId);

  return (
    <div style={styles.dashboard}>
      <div style={styles.sidebar}>
        <Sidebar
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={handleBoardSelect}
        />
      </div>
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.boardTitle}>{currentBoard?.name || 'Select a board'}</h2>
            {isOffline && <span style={styles.offlineBadge}>📡 Offline Mode</span>}
            {isConnected ? (
              <span style={styles.onlineBadge}>🟢 Live</span>
            ) : (
              <span style={styles.offlineBadge}>🔴 Disconnected</span>
            )}
          </div>
          <button
            className="btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!activeBoardId}
            style={styles.addButton}
          >
            + Add Task
          </button>
        </div>
        <div style={styles.columns}>
          {['Not Started', 'Doing', 'Done'].map(status => (
            <div key={status} style={styles.column}>
              <div style={styles.columnHeader}>
                <h4 style={styles.columnTitle}>{status}</h4>
                <span style={styles.taskCount}>
                  {tasks.filter(task => task.status === status).length}
                </span>
              </div>
              <div style={styles.taskList}>
                {tasks
                  .filter(task => task.status === status)
                  .map(task => (
                    <div
                      key={task._id}
                      style={styles.taskCard}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div style={styles.taskHeader}>
                        <h5 style={styles.taskTitle}>{task.title}</h5>
                        {task.priority && (
                          <span style={{
                            ...styles.priorityBadge,
                            backgroundColor: task.priority === 'High' ? '#ef4444' :
                                            task.priority === 'Medium' ? '#f59e0b' :
                                            '#10b981'
                          }}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p style={styles.taskDescription}>
                          {task.description.substring(0, 60)}
                          {task.description.length > 60 && '...'}
                        </p>
                      )}
                      <div style={styles.taskFooter}>
                        <span style={styles.taskAssignee}>
                          {task.assignee?.name || 'Unassigned'}
                        </span>
                        <span style={styles.taskDate}>
                          {new Date(task.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                {isLoading && <p style={styles.loading}>Loading tasks...</p>}
                {!isLoading && tasks.filter(t => t.status === status).length === 0 && (
                  <p style={styles.empty}>No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.activity}>
        <ActivityLog logs={[]} />
      </div>
      {isCreateModalOpen && (
        <CreateTaskModal
          boardId={activeBoardId}
          onClose={() => setIsCreateModalOpen(false)}
          onTaskCreated={handleTaskCreatedLocal}
        />
      )}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
      {conflictData && (
        <ConflictModal
          isOpen={true}
          onClose={() => setConflictData(null)}
          clientData={conflictData.clientData}
          serverData={conflictData.serverData}
          onResolve={handleConflictResolve}
        />
      )}
    </div>
  );
};

const styles = {
  dashboard: {
    display: 'flex',
    height: '100vh',
    background: 'var(--bg-primary)',
    gap: '20px',
    padding: '20px',
    overflow: 'hidden'
  },
  sidebar: {
    width: '280px',
    background: 'var(--glass-bg)',
    borderRadius: '12px',
    padding: '20px',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--glass-border)',
    flexShrink: 0,
    overflowY: 'auto'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minWidth: 0,
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 25px',
    background: 'var(--glass-bg)',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    flexShrink: 0
  },
  boardTitle: {
    margin: 0,
    fontSize: '1.4rem',
    color: 'var(--text-primary)'
  },
  offlineBadge: {
    fontSize: '0.75rem',
    background: '#ef4444',
    color: '#fff',
    padding: '2px 10px',
    borderRadius: '12px',
    marginLeft: '10px'
  },
  onlineBadge: {
    fontSize: '0.75rem',
    background: '#10b981',
    color: '#fff',
    padding: '2px 10px',
    borderRadius: '12px',
    marginLeft: '10px'
  },
  addButton: {
    padding: '10px 20px',
    fontSize: '0.9rem'
  },
  columns: {
    display: 'flex',
    gap: '20px',
    flex: 1,
    minHeight: 0
  },
  column: {
    flex: 1,
    background: 'var(--glass-bg)',
    borderRadius: '12px',
    padding: '15px',
    border: '1px solid var(--glass-border)',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: '1px solid var(--glass-border)'
  },
  columnTitle: {
    margin: 0,
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    fontWeight: '600'
  },
  taskCount: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    background: 'rgba(0,0,0,0.1)',
    padding: '2px 10px',
    borderRadius: '12px'
  },
  taskList: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflowY: 'auto',
    paddingRight: '5px'
  },
  taskCard: {
    background: 'var(--bg-primary)',
    padding: '12px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '1px solid var(--glass-border)',
    transition: 'all 0.2s ease',
    ':hover': {
      borderColor: 'var(--color-primary)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px'
  },
  taskTitle: {
    margin: 0,
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    fontWeight: '500',
    flex: 1
  },
  priorityBadge: {
    fontSize: '0.65rem',
    padding: '2px 8px',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: '600',
    flexShrink: 0
  },
  taskDescription: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    margin: '6px 0 8px 0',
    lineHeight: '1.3'
  },
  taskFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '4px'
  },
  taskAssignee: {
    background: 'rgba(0,0,0,0.05)',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  taskDate: {
    fontSize: '0.7rem'
  },
  loading: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    padding: '20px 0'
  },
  empty: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    padding: '20px 0'
  },
  activity: {
    width: '280px',
    background: 'var(--glass-bg)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid var(--glass-border)',
    flexShrink: 0,
    overflowY: 'auto'
  }
};

export default Dashboard;