import React from 'react';

const ActivityLog = ({ logs }) => {
  return (
    <div style={styles.container} className="glass-panel">
      <div style={styles.headerRow}>
        <h3>System Activity</h3>
        <span style={styles.liveDot}>Live</span>
      </div>
      <p style={styles.subtitle}>Recent sync events and board updates.</p>
     
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
    width: '300px', 
    padding: '20px', 
    display: 'flex', 
    flexDirection: 'column',
    gap: '10px'
  },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  liveDot: { padding: '6px 10px', borderRadius: '999px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 700 },
  subtitle: { fontSize: '0.82rem', color: 'var(--text-muted)' },

  list: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px', 
    overflowY: 'auto', 
    flex: 1 
  },

  item: { 
    borderBottom: '1px solid var(--line)', 
    paddingBottom: '10px' 
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