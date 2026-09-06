import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Plus, WifiOff, Building2, UserPlus, Calendar } from 'lucide-react';
import { useCache } from '../context/CacheContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/apiClient';
import Sidebar from '../components/Sidebar/Sidebar';
import ActivityLog from '../components/Common/ActivityLog';
import CreateTaskModal from "../components/modals/CreateTaskModal";
import ConflictModal from '../components/modals/ConflictModal';
import TaskDetailModal from '../components/modals/TaskDetailMOdal';
import CreateOrgModal from '../components/modals/CreateOrgModal';
import InviteMemberModal from '../components/modals/InviteMemberModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conflictData, setConflictData] = useState(null);

  // Organization & Workspace state
  const [organizations, setOrganizations] = useState([]);
  const [activeOrgId, setActiveOrgId] = useState(null); // null = Personal Workspace
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  let currentUser = null;
  try {
    const rawUser = localStorage.getItem('syncboard_user');
    currentUser = rawUser ? JSON.parse(rawUser) : null;
  } catch (e) {
    const raw = localStorage.getItem('syncboard_user');
    currentUser = raw ? { name: raw } : null;
  }

  const {
    taskCache,
    boardCache,
    orgCache,
    syncQueue,
    isOffline,
    isSyncing,
    pendingCount,
    setLastSync,
    syncOfflineChanges
  } = useCache();
  const { socket, isConnected, connect, joinBoard, on, off } = useSocket();
  const token = localStorage.getItem('syncboard_token');

  // Task status activity logging state
  const [sessionLogs, setSessionLogs] = useState([]);

  const addLog = (text) => {
    const time = new Date();
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      text,
      timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawTime: time.getTime()
    };
    setSessionLogs(prev => [newLog, ...prev.filter(l => l.text !== text || (time.getTime() - (l.rawTime || 0)) > 5000)].slice(0, 50));
  };

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

  const getBoardOrgId = (board) => {
    if (!board || !board.organization) return null;
    if (typeof board.organization === 'object') {
      return board.organization._id ? String(board.organization._id) : null;
    }
    return String(board.organization);
  };

  useEffect(() => {
    const loadBoards = async () => {
      setIsLoading(true);
      const cachedBoards = boardCache.getAll() || [];
      if (cachedBoards && cachedBoards.length > 0) {
        setBoards(cachedBoards);
        const matchingCached = cachedBoards.filter(b => {
          const bOrgId = getBoardOrgId(b);
          if (activeOrgId) return bOrgId === String(activeOrgId);
          return bOrgId === null;
        });
        if (matchingCached.length > 0) {
          setActiveBoardId(matchingCached[0]._id);
        } else {
          setActiveBoardId(null);
          setTasks([]);
        }
      }
      if (!isOffline) {
        try {
          const res = await api.get('/boards');
          const freshBoards = res.data.data || res.data || [];
          setBoards(freshBoards);
          boardCache.saveAll(freshBoards);
          setLastSync();
          const matchingFresh = freshBoards.filter(b => {
            const bOrgId = getBoardOrgId(b);
            if (activeOrgId) return bOrgId === String(activeOrgId);
            return bOrgId === null;
          });
          if (matchingFresh.length > 0) {
            if (!matchingFresh.some(b => b._id === activeBoardId)) {
              setActiveBoardId(matchingFresh[0]._id);
            }
          } else {
            setActiveBoardId(null);
            setTasks([]);
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
    const loadOrganizations = async () => {
      const cachedOrgs = orgCache?.getAll() || [];
      if (cachedOrgs.length > 0) {
        setOrganizations(cachedOrgs);
      }
      if (!isOffline) {
        try {
          const res = await api.get('/orgs');
          const freshOrgs = res.data.data || [];
          setOrganizations(freshOrgs);
          orgCache?.saveAll(freshOrgs);
        } catch (err) {
          console.error('Failed to load organizations:', err);
        }
      }
    };
    loadOrganizations();
  }, [isOffline]);

  // Auto-sync offline mutation queue when coming back online
  useEffect(() => {
    if (!isOffline && syncQueue && syncQueue.getPendingCount() > 0 && !isSyncing) {
      syncOfflineChanges(api, async () => {
        try {
          const bRes = await api.get('/boards');
          const fresh = bRes.data.data || bRes.data;
          setBoards(fresh);
          boardCache.saveAll(fresh);
          if (activeBoardId) {
            const tRes = await api.get(`/boards/${activeBoardId}/tasks`);
            const freshTasks = tRes.data.data || tRes.data;
            setTasks(freshTasks);
            taskCache.saveByBoard(activeBoardId, freshTasks);
          }
        } catch (err) {
          console.error('Post-sync refresh error:', err);
        }
      });
    }
  }, [isOffline]);

  // Filter boards for the active workspace (Personal or Organization)
  const displayedBoards = boards.filter(b => {
    const bOrgId = getBoardOrgId(b);
    if (activeOrgId) {
      return bOrgId === String(activeOrgId);
    }
    return bOrgId === null;
  });

  // Switch activeBoardId whenever activeOrgId changes
  useEffect(() => {
    if (boards.length === 0) return;

    const matchingBoards = boards.filter(b => {
      const bOrgId = getBoardOrgId(b);
      if (activeOrgId) {
        return bOrgId === String(activeOrgId);
      }
      return bOrgId === null;
    });

    if (matchingBoards.length > 0) {
      if (!matchingBoards.some(b => b._id === activeBoardId)) {
        setActiveBoardId(matchingBoards[0]._id);
      }
    } else {
      setActiveBoardId(null);
      setTasks([]);
    }
  }, [activeOrgId, boards]);

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
      console.log('Task created:', newTask);
      setTasks(prev => {
        if (prev.some(t => t._id === newTask._id)) return prev;
        const tempIdx = prev.findIndex(t => String(t._id).startsWith('temp_') && t.title === newTask.title);
        if (tempIdx !== -1) {
          return prev.map((t, i) => i === tempIdx ? newTask : t);
        }
        return [...prev, newTask];
      });
      taskCache.add(activeBoardId, newTask);
    };
    const handleTaskUpdated = (updatedTask) => {
      console.log('Task updated:', updatedTask);
      setTasks(prev => {
        const prevTask = prev.find(t => t._id === updatedTask._id);
        if (prevTask && prevTask.status !== updatedTask.status) {
          addLog(`Moved "${updatedTask.title}" from "${prevTask.status}" to "${updatedTask.status}"`);
        }
        const exists = prev.some(t => t._id === updatedTask._id);
        if (!exists) return [...prev, updatedTask];
        return prev.map(t => t._id === updatedTask._id ? updatedTask : t);
      });
      taskCache.update(activeBoardId, updatedTask._id, updatedTask);
    };
    const handleTaskDeleted = (taskId) => {
      console.log('Task deleted:', taskId);
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
      board: activeBoardId,
      updatedAt: new Date().toISOString(),
      history: [{ text: 'Task created', timestamp: new Date().toISOString() }]
    };
    setTasks(prev => [...prev, tempTask]);
    taskCache.add(activeBoardId, tempTask);

    if (isOffline) {
      syncQueue.enqueue({
        type: 'CREATE_TASK',
        boardId: activeBoardId,
        data: newTask,
        tempId: tempTask._id
      });
      setLastSync();
      return;
    }

    try {
      const res = await api.post(`/boards/${activeBoardId}/tasks`, newTask);
      const createdTask = res.data.data || res.data;
      setTasks(prev => {
        if (prev.some(t => t._id === createdTask._id)) {
          return prev.filter(t => t._id !== tempTask._id);
        }
        return prev.map(t => t._id === tempTask._id ? createdTask : t);
      });
      const currentTasks = taskCache.getByBoard(activeBoardId) || [];
      taskCache.saveByBoard(activeBoardId, currentTasks.filter(t => t._id !== tempTask._id).concat(createdTask));
      setLastSync();
    } catch (err) {
      console.error('Failed to create task online, queued for offline sync:', err);
      syncQueue.enqueue({
        type: 'CREATE_TASK',
        boardId: activeBoardId,
        data: newTask,
        tempId: tempTask._id
      });
      setLastSync();
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    const task = tasks.find(t => t._id === taskId);
    if (!task || task.status === targetStatus) return;

    await handleTaskUpdate(taskId, { status: targetStatus });
  };

  const handleTaskUpdate = async (taskId, updates) => {
    const oldTask = tasks.find(t => t._id === taskId);
    if (!oldTask) return;
    if (updates.status && updates.status !== oldTask.status) {
      addLog(`Moved "${oldTask.title}" from "${oldTask.status}" to "${updates.status}"`);
    }
    const optimisticTask = { ...oldTask, ...updates, updatedAt: new Date().toISOString() };
    setTasks(prev => prev.map(t => t._id === taskId ? optimisticTask : t));
    if (selectedTask && selectedTask._id === taskId) {
      setSelectedTask(optimisticTask);
    }
    const updatedTasks = tasks.map(t => t._id === taskId ? optimisticTask : t);
    taskCache.saveByBoard(activeBoardId, updatedTasks);

    if (isOffline) {
      syncQueue.enqueue({
        type: 'UPDATE_TASK',
        boardId: activeBoardId,
        taskId: taskId,
        data: updates
      });
      setLastSync();
      return;
    }

    try {
      const updatesWithTimestamp = { ...updates, _clientUpdatedAt: oldTask.updatedAt };
      const res = await api.put(`/tasks/${taskId}`, updatesWithTimestamp);
      const updatedTask = res.data.data || { ...oldTask, ...updates };
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(updatedTask);
      }
      taskCache.update(activeBoardId, taskId, updatedTask);
      setLastSync();
    } catch (err) {
      if (err.isConflict) {
        setConflictData({
          clientData: { ...oldTask, ...updates },
          serverData: err.serverData
        });
      } else {
        console.error('Failed to update task online, queued for offline sync:', err);
        syncQueue.enqueue({
          type: 'UPDATE_TASK',
          boardId: activeBoardId,
          taskId: taskId,
          data: updates
        });
        setLastSync();
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
      syncQueue.enqueue({
        type: 'DELETE_TASK',
        boardId: activeBoardId,
        taskId: taskId
      });
      setLastSync();
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      setLastSync();
    } catch (err) {
      console.error('Failed to delete task online, queued for offline sync:', err);
      syncQueue.enqueue({
        type: 'DELETE_TASK',
        boardId: activeBoardId,
        taskId: taskId
      });
      setLastSync();
    }
  };

  const handleCreateBoard = async (boardName) => {
    const tempBoard = {
      _id: `temp_board_${Date.now()}`,
      name: boardName,
      organization: activeOrgId || null,
      createdAt: new Date().toISOString()
    };

    if (isOffline) {
      const updatedBoards = [tempBoard, ...boards];
      setBoards(updatedBoards);
      setActiveBoardId(tempBoard._id);
      setTasks([]);
      boardCache.saveAll(updatedBoards);
      syncQueue.enqueue({
        type: 'CREATE_BOARD',
        data: { name: boardName, organization: activeOrgId || null },
        tempId: tempBoard._id
      });
      setLastSync();
      return;
    }

    try {
      const res = await api.post('/boards', { 
        name: boardName,
        organization: activeOrgId || null
      });
      const newBoard = res.data.data || res.data;
      const updatedBoards = [newBoard, ...boards];
      setBoards(updatedBoards);
      setActiveBoardId(newBoard._id);
      setTasks([]);
      boardCache.saveAll(updatedBoards);
      setLastSync();
    } catch (err) {
      console.error('Failed to create board online, saving offline:', err);
      const updatedBoards = [tempBoard, ...boards];
      setBoards(updatedBoards);
      setActiveBoardId(tempBoard._id);
      setTasks([]);
      boardCache.saveAll(updatedBoards);
      syncQueue.enqueue({
        type: 'CREATE_BOARD',
        data: { name: boardName, organization: activeOrgId || null },
        tempId: tempBoard._id
      });
      setLastSync();
    }
  };

  const handleDeleteBoard = async (boardId) => {
    const updatedBoards = boards.filter(b => b._id !== boardId);
    setBoards(updatedBoards);
    boardCache.saveAll(updatedBoards);
    if (activeBoardId === boardId) {
      const remainingForWorkspace = displayedBoards.filter(b => b._id !== boardId);
      if (remainingForWorkspace.length > 0) {
        setActiveBoardId(remainingForWorkspace[0]._id);
      } else {
        setActiveBoardId(null);
        setTasks([]);
      }
    }

    if (isOffline) {
      syncQueue.enqueue({
        type: 'DELETE_BOARD',
        boardId: boardId
      });
      setLastSync();
      return;
    }

    try {
      await api.delete(`/boards/${boardId}`);
      setLastSync();
    } catch (err) {
      console.error('Failed to delete board online, queued for offline sync:', err);
      syncQueue.enqueue({
        type: 'DELETE_BOARD',
        boardId: boardId
      });
      setLastSync();
    }
  };

  const handleBoardSelect = (boardId) => {
    if (boardId === activeBoardId) return;
    setActiveBoardId(boardId);
    const cached = taskCache.getByBoard(boardId) || [];
    setTasks(cached);
  };

  const handleSelectOrg = (orgId) => {
    setActiveOrgId(orgId);
    setTasks([]);
    const matching = boards.filter(b => {
      const bOrgId = getBoardOrgId(b);
      if (orgId) return bOrgId === String(orgId);
      return bOrgId === null;
    });
    if (matching.length > 0) {
      setActiveBoardId(matching[0]._id);
      const cached = taskCache.getByBoard(matching[0]._id) || [];
      setTasks(cached);
    } else {
      setActiveBoardId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('syncboard_token');
    localStorage.removeItem('syncboard_user');
    localStorage.removeItem('syncboard_auth');
    navigate('/login');
  };

  const currentOrg = organizations.find(o => String(o._id) === String(activeOrgId));
  const currentUserId = currentUser?._id || currentUser?.id;
  const isOrgAdmin = Boolean(
    currentOrg && currentUserId && (
      String(currentOrg.owner?._id || currentOrg.owner || '') === String(currentUserId) ||
      currentOrg.members?.some(
        m => String(m.user?._id || m.user || '') === String(currentUserId) && m.role === 'admin'
      )
    )
  );

  const currentBoard = displayedBoards.find(b => b._id === activeBoardId);
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Derive historical activity logs from current board's tasks (status changes only)
  const taskHistoryLogs = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    const logs = [];
    tasks.forEach(task => {
      if (Array.isArray(task.history) && task.history.length > 0) {
        task.history.forEach((h, idx) => {
          const text = h.text || '';
          // Only include entries that describe a status change or move
          const isStatusChange = /status|moved/i.test(text);
          if (!isStatusChange) return;

          const statusParts = text.split(', ').filter(part => /status|moved/i.test(part));
          const displayText = statusParts.length > 0 ? statusParts.join(', ') : text;

          const timeObj = h.timestamp ? new Date(h.timestamp) : null;
          const rawTime = timeObj && !isNaN(timeObj.getTime()) ? timeObj.getTime() : 0;
          logs.push({
            id: `task_hist_${task._id}_${idx}_${rawTime}`,
            text: `[${task.title}] ${displayText}`,
            timestamp: timeObj && !isNaN(timeObj.getTime())
              ? timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
            rawTime
          });
        });
      }
    });
    return logs;
  }, [tasks]);

  // Merge live session activity with task history, newest first
  const combinedLogs = useMemo(() => {
    const all = [...sessionLogs, ...taskHistoryLogs];
    all.sort((a, b) => (b.rawTime || 0) - (a.rawTime || 0));

    const seen = new Set();
    const unique = [];
    for (const item of all) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    return unique.slice(0, 50);
  }, [sessionLogs, taskHistoryLogs]);

  return (
    <div style={styles.dashboard}>
      <div style={styles.sidebar}>
        <Sidebar
          boards={displayedBoards}
          activeBoardId={activeBoardId}
          onSelectBoard={handleBoardSelect}
          onCreateBoard={handleCreateBoard}
          onDeleteBoard={handleDeleteBoard}
          organizations={organizations}
          activeOrgId={activeOrgId}
          onSelectOrg={handleSelectOrg}
          onCreateOrgClick={() => setIsCreateOrgModalOpen(true)}
          onInviteClick={() => setIsInviteModalOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <div style={styles.headerContext}>
              {currentOrg ? (
                <span style={styles.orgTag}>
                  <Building2 size={13} color="var(--color-primary)" /> {currentOrg.name}
                </span>
              ) : (
                <span style={styles.personalTag}>Personal Workspace</span>
              )}
              <span style={styles.dateTag} title="Today's Date">
                <Calendar size={13} color="var(--text-muted)" />
                {formattedDate}
              </span>
              {currentOrg && currentOrg.members && currentOrg.members.length > 0 && (
                <span 
                  style={styles.headerMembersBadge} 
                  title={currentOrg.members.map(m => m.user?.name || (typeof m.user === 'string' ? m.user : 'Member')).join(', ')}
                >
                  Team: {currentOrg.members.map(m => m.user?.name || (typeof m.user === 'string' ? m.user : 'Member')).join(', ')}
                </span>
              )}
            </div>
            <h2 style={styles.boardTitle}>{currentBoard?.name || 'Select a board'}</h2>
            {isOffline && <span style={styles.offlineBadge}><WifiOff size={13} aria-hidden="true" /> Offline Mode</span>}
            {isConnected ? (
              <span style={styles.onlineBadge}><CheckCircle2 size={13} aria-hidden="true" /> Live</span>
            ) : (
              <span style={styles.offlineBadge}><Circle size={13} aria-hidden="true" /> Disconnected</span>
            )}
          </div>
          <div style={styles.headerActions}>
            {currentOrg && isOrgAdmin && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsInviteModalOpen(true)}
                style={styles.inviteHeaderBtn}
                title="Invite team member"
              >
                <UserPlus size={15} /> Invite Member
              </button>
            )}
            <button
              className="btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={!activeBoardId}
              style={styles.addButton}
            >
              <Plus size={16} aria-hidden="true" /> Add Task
            </button>
          </div>
        </div>
        {/* Offline & Sync Notification Banner */}
        {isOffline && (
          <div style={styles.offlineBanner}>
            <div style={styles.offlineBannerLeft}>
              <WifiOff size={15} color="#f59e0b" />
              <span>
                <strong>Working Offline:</strong> Changes are saved locally and will auto-sync when connection is restored.
              </span>
              {pendingCount > 0 && (
                <span style={styles.pendingBadge}>
                  {pendingCount} {pendingCount === 1 ? 'change' : 'changes'} pending
                </span>
              )}
            </div>
            <button
              type="button"
              style={styles.syncBtn}
              onClick={() => {
                if (!isOffline) {
                  syncOfflineChanges(api, async () => {
                    const bRes = await api.get('/boards');
                    setBoards(bRes.data.data || bRes.data);
                  });
                } else {
                  alert('You are currently offline. Reconnect to the network to sync changes.');
                }
              }}
            >
              Sync Status
            </button>
          </div>
        )}
        {isSyncing && (
          <div style={styles.syncingBanner}>
            <span>🔄</span>
            <span>Syncing offline changes with database...</span>
          </div>
        )}
        {!activeBoardId ? (
          <div style={styles.emptyWorkspace}>
            <Building2 size={42} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.6 }} />
            <h3 style={styles.emptyWorkspaceTitle}>
              {currentOrg ? `No boards in ${currentOrg.name}` : 'No Personal Boards'}
            </h3>
            <p style={styles.emptyWorkspaceText}>
              {currentOrg
                ? `Create a board in the sidebar to collaborate on tasks with ${currentOrg.name} members.`
                : 'Create a personal board in the sidebar to organize your personal tasks.'}
            </p>
          </div>
        ) : (
          <div style={styles.columns}>
            {['Not Started', 'Doing', 'Done'].map(status => (
              <div
                key={status}
                style={styles.column}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
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
                        style={{ ...styles.taskCard, cursor: 'grab' }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id)}
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
                            {typeof task.assignee === 'object' && task.assignee !== null
                              ? (task.assignee.name || 'Unassigned')
                              : (task.assignee || 'Unassigned')}
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
        )}
      </div>
      <div style={styles.activity}>
        <ActivityLog logs={combinedLogs} isLive={!isOffline && isConnected} />
      </div>
      {isCreateModalOpen && (
        <CreateTaskModal
          boardId={activeBoardId}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleTaskCreatedLocal}
          isOrg={Boolean(activeOrgId)}
          orgMembers={currentOrg?.members || []}
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

      {/* Organization Modals */}
      <CreateOrgModal
        isOpen={isCreateOrgModalOpen}
        onClose={() => setIsCreateOrgModalOpen(false)}
        onOrgCreated={(newOrg) => {
          setOrganizations(prev => [newOrg, ...prev]);
          setActiveOrgId(newOrg._id);
          setActiveBoardId(null);
          setTasks([]);
        }}
      />
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        organization={currentOrg}
      />
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
  headerContext: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px'
  },
  orgTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--color-primary)',
    background: 'rgba(99, 102, 241, 0.1)',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  personalTag: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500'
  },
  dateTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--glass-border)',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  headerMembersBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.75rem',
    color: 'var(--color-primary)',
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    padding: '2px 8px',
    borderRadius: '6px',
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  inviteHeaderBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    fontSize: '0.9rem',
    borderRadius: '8px'
  },
  boardTitle: {
    margin: 0,
    fontSize: '1.4rem',
    color: 'var(--text-primary)'
  },
  offlineBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    background: '#ef4444',
    color: '#fff',
    padding: '2px 10px',
    borderRadius: '12px',
    marginLeft: '10px'
  },
  onlineBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    background: '#10b981',
    color: '#fff',
    padding: '2px 10px',
    borderRadius: '12px',
    marginLeft: '10px'
  },
  addButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 20px',
    fontSize: '0.9rem'
  },
  offlineBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '0.85rem',
    color: '#fbbf24',
    flexShrink: 0
  },
  offlineBannerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  pendingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '12px',
    background: 'rgba(245, 158, 11, 0.25)',
    color: '#fef3c7',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  syncBtn: {
    padding: '4px 10px',
    fontSize: '0.75rem',
    borderRadius: '6px',
    background: 'rgba(245, 158, 11, 0.2)',
    border: '1px solid rgba(245, 158, 11, 0.4)',
    color: '#fef3c7',
    cursor: 'pointer',
    fontWeight: '600'
  },
  syncingBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(99, 102, 241, 0.12)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '0.85rem',
    color: 'var(--color-primary)',
    flexShrink: 0
  },
  emptyWorkspace: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px 20px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    border: '1px dashed var(--glass-border)',
    textAlign: 'center'
  },
  emptyWorkspaceTitle: {
    margin: '0 0 8px 0',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  emptyWorkspaceText: {
    margin: 0,
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    maxWidth: '440px',
    lineHeight: '1.5'
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