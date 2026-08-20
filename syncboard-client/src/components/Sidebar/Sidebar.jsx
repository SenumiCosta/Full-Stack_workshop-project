import React, { useState, useEffect } from 'react';
import api from '../../api/apiClient';

const Sidebar = ({ activeBoardId, onSelectBoard }) => {
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');

  // Fetch boards when component loads
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await api.get('/boards');
        setBoards(res.data);
        if (res.data.length > 0 && !activeBoardId) {
          onSelectBoard(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch boards:', err);
        alert('Failed to load boards. Please make sure the server is running.');
      }
    };
    fetchBoards();
  }, []);

  // Create a new board
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    try {
      const res = await api.post('/boards', { name: newBoardName });
      setBoards([...boards, res.data]);
      setNewBoardName('');
      onSelectBoard(res.data._id);
    } catch (err) {
      console.error('Failed to create board:', err);
      alert('Failed to create board');
    }
  };

  // Delete a board
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this board?')) return;
    try {
      await api.delete(`/boards/${id}`);
      const updated = boards.filter(b => b._id !== id);
      setBoards(updated);
      if (activeBoardId === id && updated.length > 0) {
        onSelectBoard(updated[0]._id);
      }
    } catch (err) {
      console.error('Failed to delete board:', err);
      alert('Failed to delete board');
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={{ marginBottom: '15px' }}>My Boards</h3>
      <div style={styles.list}>
        {boards.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No boards yet. Create one below!
          </p>
        ) : (
          boards.map(board => (
            <div
              key={board._id}
              style={{
                ...styles.item,
                background: board._id === activeBoardId ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                borderColor: board._id === activeBoardId ? 'var(--color-primary)' : 'transparent'
              }}
            >
              <span style={styles.link} onClick={() => onSelectBoard(board._id)}>
                📁 {board.name}
              </span>
              {boards.length > 1 && (
                <button 
                  style={styles.deleteBtn} 
                  onClick={() => handleDelete(board._id)}
                  aria-label="Delete board"
                >
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
        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '8px' }}>
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
    flex: 1 
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
  }
};

export default Sidebar;