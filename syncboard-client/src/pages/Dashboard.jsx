import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoardContext } from '../context/BoardContext';

import Sidebar from '../components/Sidebar/Sidebar';
import ActivityLog from '../components/Common/ActivityLog';
import CreateTaskModal from '../components/Modals/CreateTaskModal';

const OnlineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const OfflineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 8l8 8" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="8" r="4" />
  </svg>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalTargetStatus, setModalTargetStatus] = useState('Not Started');

  const {
    boards,
    activeBoard,
    activeBoardId,
    setActiveBoardId,
    isOffline,
    toggleConnection,
    moveTask,
    createBoard,
    deleteBoard,
    addTask,
    activityLogs
  } = useContext(BoardContext);

  const handleLogout = () => {
    localStorage.removeItem('syncboard_auth');
    localStorage.removeItem('syncboard_user');
    navigate('/login');
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (activeBoard && taskId) {
      const currentUser = localStorage.getItem('syncboard_user') || 'User';
      moveTask(activeBoard.id, taskId, targetStatus, currentUser);
    }
  };

  const handleOpenCreateModal = (status) => {
    setModalTargetStatus(status);
    setShowCreateModal(true);
  };

  const handleSaveTask = (taskDetails) => {
    if (!activeBoard) return;
    addTask(activeBoard.id, {
      ...taskDetails,
      status: modalTargetStatus
    });
  };

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.navbar} className="glass-panel">
        <div style={styles.brandArea}>
          <div>
            <h2 style={styles.logo}>SyncBoard</h2>
            <p style={styles.navSubtitle}>Project workspace and workflow overview</p>
          </div>
          <span style={styles.navBadge}>Board {boards.length}</span>
        </div>
        <div style={styles.navActions}>
          <button
            className="btn-secondary"
            onClick={toggleConnection}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--line-strong)',
              background: isOffline ? 'rgba(37, 99, 235, 0.04)' : 'rgba(15, 23, 42, 0.03)',
              color: isOffline ? 'var(--color-primary)' : 'var(--text-main)'
            }}
          >
            {isOffline ? <OfflineIcon /> : <OnlineIcon />}
            {isOffline ? 'Go Online' : 'Go Offline'}
          </button>
          <button className="btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div style={styles.mainLayout}>
        <aside style={styles.sidebar} className="glass-panel">
          <Sidebar
            boards={boards}
            activeBoardId={activeBoardId}
            onSelectBoard={setActiveBoardId}
            onCreateBoard={createBoard}
            onDeleteBoard={deleteBoard}
          />
        </aside>

        <main style={styles.boardArea}>
          {activeBoard ? (
            <div>
              <div style={styles.boardHeader}>
                <div>
                  <h1 style={styles.boardTitle}>{activeBoard.name}</h1>
                  <p style={styles.boardMeta}>Showing tasks grouped by workflow stage</p>
                </div>
                <span style={styles.boardCount}>{activeBoard.tasks.length} tasks</span>
              </div>

              <div style={styles.columnsGrid}>
                {['Not Started', 'In Progress', 'Done'].map((status) => (
                  <div
                    key={status}
                    className="glass-panel"
                    style={styles.column}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    <div style={styles.columnHeaderContainer}>
                      <div>
                        <h3 style={styles.columnHeader}>{status}</h3>
                        <p style={styles.columnSubheader}>Tasks in this stage</p>
                      </div>
                      <button
                        style={styles.addTaskInlineBtn}
                        onClick={() => handleOpenCreateModal(status)}
                        title="Add Task to this column"
                        aria-label={`Add task to ${status}`}
                      >
                        <PlusIcon />
                      </button>
                    </div>

                    <div style={styles.taskList}>
                      {activeBoard.tasks
                        .filter((task) => task.status === status)
                        .map((task) => (
                          <div
                            key={task.id}
                            style={styles.taskCard}
                            className="glass-panel"
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                          >
                            <h4 style={styles.taskTitle}>{task.title}</h4>
                            <p style={styles.taskDescription}>{task.description}</p>
                            <div style={styles.taskMetaRow}>
                              <span
                                style={{
                                  ...styles.priorityTag,
                                  background:
                                    task.priority === 'High'
                                      ? 'rgba(220, 38, 38, 0.12)'
                                      : task.priority === 'Medium'
                                        ? 'rgba(217, 119, 6, 0.12)'
                                        : 'rgba(22, 163, 74, 0.12)',
                                  color:
                                    task.priority === 'High'
                                      ? '#b91c1c'
                                      : task.priority === 'Medium'
                                        ? '#b45309'
                                        : '#15803d'
                                }}
                              >
                                {task.priority}
                              </span>
                              <span style={styles.assignee}>
                                <UserIcon /> {task.assignee}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>

                    <button style={styles.addTaskColBtn} onClick={() => handleOpenCreateModal(status)}>
                      <PlusIcon /> Add Task Card
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.emptyState} className="glass-panel">
              <h2>No Active Board</h2>
              <p>Create a board in the sidebar to get started.</p>
            </div>
          )}
        </main>

        <ActivityLog logs={activityLogs} />
      </div>

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
};

const styles = {
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    padding: '108px 16px 16px',
    gap: '14px'
  },
  navbar: {
    position: 'fixed',
    top: '16px',
    left: '16px',
    right: '16px',
    zIndex: 100,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 24px',
    borderRadius: '24px',
    minHeight: '76px'
  },
  brandArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  logo: {
    fontSize: '1.8rem',
    lineHeight: 1
  },
  navSubtitle: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    marginTop: '4px'
  },
  navBadge: {
    padding: '7px 10px',
    borderRadius: '999px',
    border: '1px solid var(--line)',
    background: 'rgba(255, 255, 255, 0.7)',
    color: 'var(--text-muted)',
    fontSize: '0.78rem',
    fontWeight: 700,
    whiteSpace: 'nowrap'
  },
  navActions: {
    display: 'flex',
    alignItems: 'center'
  },
  mainLayout: {
    display: 'flex',
    flex: 1,
    gap: '18px',
    overflow: 'hidden'
  },
  sidebar: {
    width: '290px',
    padding: '18px',
    overflow: 'hidden'
  },
  boardArea: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '6px'
  },
  boardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
    marginBottom: '18px'
  },
  boardTitle: {
    fontSize: '2rem',
    marginBottom: '6px'
  },
  boardMeta: {
    color: 'var(--text-muted)'
  },
  boardCount: {
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'rgba(37, 99, 235, 0.08)',
    color: 'var(--color-primary)',
    fontSize: '0.85rem',
    fontWeight: 700
  },
  columnsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '18px'
  },
  column: {
    padding: '18px',
    minHeight: '560px',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255,255,255,0.88)'
  },
  columnHeaderContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '14px',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--line)'
  },
  columnHeader: {
    fontSize: '1.15rem',
    marginBottom: '4px'
  },
  columnSubheader: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)'
  },
  addTaskInlineBtn: {
    background: '#fff',
    border: '1px solid var(--line)',
    color: 'var(--color-primary)',
    width: '34px',
    height: '34px',
    padding: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center'
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    flex: 1,
    overflowY: 'auto'
  },
  taskCard: {
    padding: '16px',
    background: '#fff',
    borderRadius: '18px',
    cursor: 'grab',
    border: '1px solid var(--line)',
    boxShadow: '0 8px 18px rgba(35, 42, 52, 0.05)'
  },
  taskTitle: {
    fontSize: '1rem',
    marginBottom: '8px'
  },
  taskDescription: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '12px'
  },
  taskMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px'
  },
  priorityTag: {
    fontSize: '0.75rem',
    padding: '4px 8px',
    borderRadius: '999px',
    fontWeight: 700
  },
  assignee: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  addTaskColBtn: {
    width: '100%',
    background: 'rgba(37, 99, 235, 0.04)',
    border: '1px dashed rgba(37, 99, 235, 0.24)',
    color: 'var(--color-primary)',
    padding: '12px',
    marginTop: '15px',
    fontSize: '0.9rem',
    borderRadius: '999px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  emptyState: {
    textAlign: 'center',
    marginTop: '100px',
    padding: '60px 20px'
  }
};

export default Dashboard;