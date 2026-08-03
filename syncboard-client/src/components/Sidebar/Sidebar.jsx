import React from 'react';

const Sidebar = ({ boards, activeBoardId, onSelectBoard, onCreateBoard, onDeleteBoard }) => {
  const [newBoardName, setNewBoardName] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      onCreateBoard(newBoardName);
      setNewBoardName('');
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={{ marginBottom: '15px' }}>My Boards</h3>
     
      <div style={styles.list}>
        {boards.map(board => (
          <div
            key={board.id}
            style={{
              ...styles.item,
              background: board.id === activeBoardId ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: board.id === activeBoardId ? 'var(--color-primary)' : 'transparent'
            }}
          >
            <span style={styles.link} onClick={() => onSelectBoard(board.id)}>
              📁 {board.name}
            </span>
            {boards.length > 1 && (
              <button style={styles.deleteBtn} onClick={() => onDeleteBoard(board.id)}>🗑️</button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="New Board Name..."
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '8px' }}>+ Create Board</button>
      </form>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100%' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' },
  item: { display: 'flex', justifycontent: 'space-between', padding: '10px', borderRadius: '8px', border: '1px solid transparent' },
  link: { cursor: 'pointer', flex: 1 },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' },
  form: { marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' },
  input: { marginBottom: '10px', fontSize: '0.85rem' }
};

export default Sidebar;
