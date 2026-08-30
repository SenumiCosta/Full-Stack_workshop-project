import React from 'react';

const TaskDetailModal = ({ task, onClose, onSave, onDelete }) => {
  if (!task) return null;

  const handleStatusChange = (newStatus) => {
    onSave(task._id, { status: newStatus });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task._id);
      onClose();
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div 
        className="glass-panel" 
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={styles.title}>{task.title}</h2>

        <div style={styles.infoGrid}>
          <div>
            <p style={styles.label}>Assignee</p>
            <p style={styles.value}>{task.assignee?.name || 'Unassigned'}</p>
          </div>
          <div>
            <p style={styles.label}>Priority</p>
            <p style={{
              ...styles.value,
              ...styles.priorityBadge,
              backgroundColor: task.priority === 'High' ? '#ef4444' :
                              task.priority === 'Medium' ? '#f59e0b' :
                              '#10b981'
            }}>
              {task.priority || 'Medium'}
            </p>
          </div>
          <div>
            <p style={styles.label}>Status</p>
            <select
              value={task.status || 'Not Started'}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={styles.statusSelect}
            >
              <option value="Not Started">Not Started</option>
              <option value="Doing">Doing</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div>
            <p style={styles.label}>Created</p>
            <p style={styles.value}>
              {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Description</h4>
          <p style={styles.description}>
            {task.description || 'No description provided.'}
          </p>
        </div>

        {task.history && task.history.length > 0 && (
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Activity History</h4>
            <div style={styles.historyList}>
              {task.history.map((log, index) => (
                <div key={index} style={styles.historyItem}>
                  <span style={styles.historyText}>{log.text}</span>
                  <span style={styles.historyTime}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.actions}>
          <button
            className="btn-secondary"
            onClick={handleDelete}
            style={styles.deleteBtn}
          >
            🗑️ Delete
          </button>
          <button
            className="btn-secondary"
            onClick={onClose}
            style={styles.closeBtn}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    width: '100%',
    maxWidth: '550px',
    padding: '30px',
    maxHeight: '80vh',
    overflowY: 'auto',
    background: 'var(--glass-bg)',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    backdropFilter: 'blur(10px)'
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '1.5rem',
    color: 'var(--text-primary)'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '20px',
    padding: '15px',
    background: 'rgba(0,0,0,0.05)',
    borderRadius: '8px'
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    margin: '0 0 4px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  value: {
    fontSize: '0.95rem',
    margin: 0,
    color: 'var(--text-primary)'
  },
  priorityBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  statusSelect: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid var(--glass-border)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    width: '100%'
  },
  section: {
    marginTop: '20px'
  },
  sectionTitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  description: {
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: '1.5'
  },
  historyList: {
    maxHeight: '150px',
    overflowY: 'auto',
    border: '1px solid var(--glass-border)',
    borderRadius: '6px',
    padding: '8px 12px'
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid var(--glass-border)',
    fontSize: '0.85rem'
  },
  historyText: {
    color: 'var(--text-primary)'
  },
  historyTime: {
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    flexShrink: 0,
    marginLeft: '10px'
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid var(--glass-border)'
  },
  deleteBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #ef4444',
    background: 'transparent',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  closeBtn: {
    padding: '8px 20px',
    borderRadius: '6px',
    border: '1px solid var(--glass-border)',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.9rem'
  }
};

export default TaskDetailModal;