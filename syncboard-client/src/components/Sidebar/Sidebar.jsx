import React, { useState, useEffect } from 'react';
import api from '../../api/apiClient';
import { useCache } from '../../context/CacheContext';

const Sidebar = ({ boards = [], activeBoardId, onSelectBoard, onCreateBoard, onDeleteBoard }) => {
  const [newBoardName, setNewBoardName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { boardCache, isOffline, setLastSync } = useCache();

  useEffect(() => {
    const loadBoards = async () => {
      setIsLoading(true);
      const cachedBoards = boardCache.getAll();
      if (cachedBoards && cachedBoards.length > 0) {
        if (onSelectBoard && !activeBoardId) {
          onSelectBoard(cachedBoards[0]._id);
        }
      }
      if (!isOffline) {
        try {
          const res = await api.get('/boards');
          const freshBoards = res.data.data || res.data || [];
          if (onSelectBoard && freshBoards.length > 0 && !activeBoardId) {
            onSelectBoard(freshBoards[0]._id);
          }
        } catch (err) {
          console.error('Failed to fetch boards:', err);
        }
      }
      setIsLoading(false);
    };
    loadBoards();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    if (onCreateBoard) {
      await onCreateBoard(newBoardName);
      setNewBoardName('');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this board?')) return;
    if (onDeleteBoard) {
      await onDeleteBoard(id);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>My Boards</h3>
        {isOffline && <span style={styles.offlineBadge}>📡 Offline</span>}
      </div>
      <div style={styles.list}>
        {isLoading ? (
          <p style={styles.loading}>Loading boards...</p>
        ) : !boards || boards.length === 0 ? (
          <p style={styles.empty}>No boards yet. Create one below!</p>
        ) : (
          Array.isArray(boards) && boards.map(board => (
            <div
              key={board._id}
              style={{
                ...styles.item,
                background: board._id === activeBoardId ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                borderColor: board._id === activeBoardId ? 'var(--color-primary)' : 'transparent'
              }}
            >
              <span style={styles.link} onClick={() => onSelectBoard && onSelectBoard(board._id)}>
                📁 {board.name}
              </span>
              {boards.length > 1 && (
                <button style={styles.deleteBtn} onClick={() => handleDelete(board._id)}>
                  🗑️
                </button>
              )}
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleCreate} style={styles.form}>
        <input
          type="text"
          placeholder="New Board Name..."
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" className="btn-primary" style={styles.createBtn}>
          + Create Board
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    color: 'var(--text-primary)'
  },
  offlineBadge: {
    fontSize: '0.7rem',
    background: '#f59e0b',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    overflowY: 'auto'
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid transparent',
    alignItems: 'center'
  },
  link: {
    cursor: 'pointer',
    flex: 1,
    fontSize: '0.9rem'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  form: {
    marginTop: '20px',
    borderTop: '1px solid var(--glass-border)',
    paddingTop: '20px'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    marginBottom: '10px',
    fontSize: '0.85rem',
    borderRadius: '6px',
    border: '1px solid var(--glass-border)',
    backgroundColor: 'var(--glass-bg)',
    color: 'var(--text-primary)'
  },
  createBtn: {
    width: '100%',
    padding: '8px',
    fontSize: '0.9rem'
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
  }
};

export default Sidebar;