import React from 'react';

const BoardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: '8px', verticalAlign: 'middle' }}
  >
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3A2.5 2.5 0 0 1 11 7.5v9A2.5 2.5 0 0 1 8.5 19h-3A2.5 2.5 0 0 1 3 16.5z"></path>
    <path d="M13 7.5A2.5 2.5 0 0 1 15.5 5h3A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-3A2.5 2.5 0 0 1 13 16.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18"></path>
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"></path>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
    <path d="M10 11v6"></path>
    <path d="M14 11v6"></path>
  </svg>
);

const PlusIcon = () => (
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
    style={{ marginRight: '6px', verticalAlign: 'middle' }}
  >
    <path d="M12 5v14"></path>
    <path d="M5 12h14"></path>
  </svg>
);

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
      <div style={styles.headerRow}>
        <h3 style={styles.title}>My Boards</h3>
        <span style={styles.badge}>{boards.length}</span>
      </div>
     
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
              <BoardIcon /> {board.name}
            </span>
            <button style={styles.deleteBtn} onClick={() => onDeleteBoard(board.id)} aria-label={`Delete ${board.name}`}>
              <DeleteIcon />
            </button>
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
        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px 14px', borderRadius: '999px' }}>
          <PlusIcon /> Create Board
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100%' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  title: { fontSize: '1.15rem' },
  badge: { minWidth: '30px', height: '30px', borderRadius: '999px', display: 'grid', placeItems: 'center', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 700 },
  list: { display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' },
  item: { display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '16px', border: '1px solid var(--line)', alignItems: 'center', background: '#fff' },
  link: { cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', fontSize: '0.94rem' },
  deleteBtn: { background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  form: { marginTop: '20px', borderTop: '1px solid var(--line)', paddingTop: '18px' },
  input: { marginBottom: '10px', fontSize: '0.9rem' }
};

export default Sidebar;
