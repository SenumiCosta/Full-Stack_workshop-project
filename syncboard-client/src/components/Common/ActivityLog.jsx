import React from 'react';

const ActivityLog = ({ logs }) => {
  return (
    <div style={styles.container} className="glass-panel">
      <h3>System Activity</h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
        Live activity log and sync history
      </p>
     
      <div style={styles.list}>
        {logs && logs.length > 0 ? (
          logs.map(log => (
            <div key={log.id} style={styles.item}>
              <p style={styles.text}>{log.text}</p>
              <span style={styles.time}>{log.timestamp}</span>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No system logs yet.
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { 
    width: '280px', 
    padding: '20px', 
    display: 'flex', 
    flexDirection: 'column' 
  },

  list: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px', 
    overflowY: 'auto', 
    flex: 1 
  },

  item: { 
    borderBottom: '1px solid var(--glass-border)', 
    paddingBottom: '8px' 
  },

  text: { 
    fontSize: '0.85rem', 
    lineHeight: '1.3' 
  },

  time: { 
    fontSize: '0.75rem', 
    color: 'var(--text-muted)' 
  }
};

export default ActivityLog;