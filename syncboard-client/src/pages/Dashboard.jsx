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
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: '10px'
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