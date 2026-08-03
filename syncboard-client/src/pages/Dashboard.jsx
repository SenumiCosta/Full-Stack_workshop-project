import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BoardContext } from '../context/BoardContext';

// --- SLEEK SVG ICON COMPONENTS ---

const FolderIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ marginRight: '8px', verticalAlign: 'middle', opacity: 0.8 }}
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ verticalAlign: 'middle' }}
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const OnlineIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="12" 
    height="12" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#10b981" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ marginRight: '8px', verticalAlign: 'middle' }}
  >
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);

const OfflineIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="12" 
    height="12" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#ef4444" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ marginRight: '8px', verticalAlign: 'middle' }}
  >
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);

// --- MAIN DASHBOARD COMPONENT ---

const Dashboard = () => {
  const navigate = useNavigate();
  const [newBoardName, setNewBoardName] = useState('');

  const { 
    boards,
    activeBoard, 
    activeBoardId,
    setActiveBoardId,
    isOffline, 
    toggleConnection, 
    moveTask,
    createBoard,
    deleteBoard
  } = useContext(BoardContext);

  const handleLogout = () => {
    localStorage.removeItem('syncboard_auth');
    localStorage.removeItem('syncboard_user');
    navigate('/login');
  };

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      createBoard(newBoardName);
      setNewBoardName('');
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (activeBoard && taskId) {
      moveTask(activeBoard.id, taskId, targetStatus, 'Senumi (Lead)');
    }
  };

  return (
    <div style={styles.dashboardContainer}>
      {/* Header Navbar */}
      <header style={styles.navbar} className="glass-panel">
        <h2 style={styles.logo}>SyncBoard</h2>
        <div style={styles.navActions}>
          <button 
            className="btn-secondary" 
            onClick={toggleConnection}
            style={{ 
              marginRight: '15px', 
              display: 'flex', 
              alignItems: 'center',
              border: isOffline ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
              background: isOffline ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)'
            }}
          >
            {isOffline ? <OfflineIcon /> : <OnlineIcon />}
            {isOffline ? 'Go Online' : 'Go Offline'}
          </button>
          <button className="btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div style={styles.mainLayout}>
        {/* Sidebar Workspace */}
        <aside style={styles.sidebar} className="glass-panel">
          <h3 style={{ marginBottom: '15px' }}>My Boards</h3>
          
          {/* Boards List */}
          <div style={styles.boardList}>
            {boards.map(board => (
              <div 
                key={board.id} 
                style={{
                  ...styles.boardItem,
                  background: board.id === activeBoardId ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  borderColor: board.id === activeBoardId ? 'var(--color-primary)' : 'transparent'
                }}
              >
                <span 
                  style={styles.boardNameLink} 
                  onClick={() => setActiveBoardId(board.id)}
                >
                  <FolderIcon /> {board.name}
                </span>
                
                {/* Delete button */}
                {boards.length > 1 && (
                  <button 
                    onClick={() => deleteBoard(board.id)} 
                    style={styles.deleteBoardBtn}
                    title="Delete Board"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Create Board Form */}
          <form onSubmit={handleCreateBoard} style={styles.createForm}>
            <input 
              type="text" 
              placeholder="New Board Name..." 
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              style={styles.createInput}
              required
            />
            <button type="submit" className="btn-primary" style={styles.createBtn}>
              + Create Board
            </button>
          </form>
        </aside>

        {/* Taskboard Area */}
        <main style={styles.boardArea}>
          {activeBoard ? (
            <div>
              <h1 style={styles.boardTitle}>{activeBoard.name}</h1>
              
              {/* Columns Grid */}
              <div style={styles.columnsGrid}>
                {['Not Started', 'In Progress', 'Done'].map(status => (
                  <div 
                    key={status} 
                    className="glass-panel" 
                    style={styles.column}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    <h3 style={styles.columnHeader}>{status}</h3>
                    <div style={styles.taskList}>
                      {activeBoard.tasks
                        .filter(t => t.status === status)
                        .map(task => (
                          <div 
                            key={task.id} 
                            style={styles.taskCard} 
                            className="glass-panel"
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                          >
                            <h4>{task.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                              Assignee: {task.assignee}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
              <h2>No Active Board</h2>
              <p style={{ color: 'var(--text-muted)' }}>Create a board in the sidebar to get started!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '20px',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    marginBottom: '20px',
  },
  logo: {
    background: 'linear-gradient(to right, #6366f1, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
  },
  mainLayout: {
    display: 'flex',
    flex: 1,
    gap: '20px',
    overflow: 'hidden',
  },
  sidebar: {
    width: '260px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  boardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
    flex: 1,
  },
  boardItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid transparent',
    transition: 'var(--transition-smooth)',
  },
  boardNameLink: {
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  deleteBoardBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 5px',
    fontSize: '0.9rem',
    opacity: 0.6,
    transition: 'opacity 0.2s',
    color: '#ef4444',
  },
  createForm: {
    marginTop: '20px',
    borderTop: '1px solid var(--glass-border)',
    paddingTop: '20px',
  },
  createInput: {
    marginBottom: '10px',
    fontSize: '0.85rem',
  },
  createBtn: {
    width: '100%',
    padding: '8px',
    fontSize: '0.9rem',
  },
  boardArea: {
    flex: 1,
    overflowY: 'auto',
  },
  boardTitle: {
    marginBottom: '20px',
  },
  columnsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  column: {
    padding: '20px',
    minHeight: '500px',
    background: 'var(--bg-column)',
  },
  columnHeader: {
    marginBottom: '15px',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '10px',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  taskCard: {
    padding: '15px',
    background: 'rgba(255, 255, 255, 0.03)',
    cursor: 'grab',
  }
};

export default Dashboard;