import React from 'react';

const ActivityLog = ({ logs = [], isLive = true }) => {
  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h3 style={styles.title}>Task Activity</h3>
        <span style={{
          ...styles.liveDot,
          background: isLive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          color: isLive ? '#10b981' : '#f59e0b'
        }}>
          {isLive ? '● Live' : '○ Offline'}
        </span>
      </div>
      <p style={styles.subtitle}>Recent task status transitions and column moves.</p>
     
      <div style={styles.list}>
        {logs && logs.length > 0 ? (
          logs.map((log, idx) => (
            <div key={log.id || `${log.text}_${idx}`} style={styles.item}>
              <div style={styles.itemHeader}>
                <span style={styles.dot} />
                <p style={styles.text}>{log.text}</p>
              </div>
              <span style={styles.time}>{log.timestamp}</span>
            </div>
          ))
        ) : (
          <div style={styles.emptyContainer}>
            <p style={styles.emptyText}>
              No task status changes yet.
            </p>
            <span style={styles.emptySubtext}>
              Changes to task status (e.g., Not Started → Doing → Done) will appear here.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { 
    width: '100%', 
    height: '100%',
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px'
  },
  headerRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  liveDot: { 
    padding: '3px 8px', 
    borderRadius: '12px', 
    fontSize: '0.72rem', 
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  subtitle: { 
    fontSize: '0.78rem', 
    color: 'var(--text-muted)',
    margin: '0 0 6px 0'
  },
  list: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px', 
    overflowY: 'auto', 
    flex: 1,
    paddingRight: '4px'
  },
  item: { 
    borderBottom: '1px solid var(--glass-border)', 
    paddingBottom: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px'
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--color-primary)',
    marginTop: '6px',
    flexShrink: 0
  },
  text: { 
    fontSize: '0.82rem', 
    lineHeight: '1.4',
    color: 'var(--text-primary)',
    margin: 0,
    flex: 1
  },
  time: { 
    fontSize: '0.7rem', 
    color: 'var(--text-muted)',
    display: 'block',
    marginLeft: '12px'
  },
  emptyContainer: {
    padding: '24px 8px',
    textAlign: 'center'
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    margin: '0 0 6px 0'
  },
  emptySubtext: {
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    opacity: 0.7,
    display: 'block'
  }
};

export default ActivityLog;