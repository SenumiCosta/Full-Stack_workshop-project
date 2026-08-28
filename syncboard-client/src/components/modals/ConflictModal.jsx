import React from 'react';
import { getDifferences, mergeData } from '../../utils/conflict';

const ConflictModal = ({ 
  isOpen, 
  onClose, 
  clientData, 
  serverData, 
  onResolve 
}) => {
  if (!isOpen) return null;

  const differences = getDifferences(clientData, serverData);

  const handleResolve = (resolution) => {
    const merged = mergeData(clientData, serverData, resolution);
    onResolve(merged);
    onClose();
  };

  return (
    <div style={styles.backdrop}>
      <div className="glass-panel" style={styles.modal}>
        <h2 style={styles.title}>⚠️ Conflict Detected</h2>
        <p style={styles.subtitle}>
          This item has been modified by someone else. 
          Please choose which version to keep.
        </p>

        <div style={styles.differences}>
          <h4>Changes:</h4>
          {differences.length === 0 ? (
            <p style={styles.noChanges}>No significant differences found</p>
          ) : (
            <ul style={styles.list}>
              {differences.map((diff, index) => (
                <li key={index} style={styles.listItem}>
                  <span style={styles.field}>{diff.field}:</span>
                  <div style={styles.values}>
                    <span style={styles.clientValue}>Your: {String(diff.clientValue || 'None')}</span>
                    <span style={styles.serverValue}>Server: {String(diff.serverValue || 'None')}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={styles.timestamps}>
          <p>Last updated (your version): {new Date(clientData.updatedAt).toLocaleString()}</p>
          <p>Last updated (server): {new Date(serverData.updatedAt).toLocaleString()}</p>
        </div>

        <div style={styles.actions}>
          <button 
            className="btn-secondary" 
            onClick={() => handleResolve('client')}
            style={styles.actionBtn}
          >
            Keep My Version
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => handleResolve('server')}
            style={styles.actionBtn}
          >
            Use Server Version
          </button>
          <button 
            className="btn-primary" 
            onClick={() => handleResolve('merge')}
            style={styles.actionBtn}
          >
            Merge Changes
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
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },
  modal: {
    width: '100%',
    maxWidth: '600px',
    padding: '30px',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  title: {
    color: '#f59e0b',
    marginBottom: '10px'
  },
  subtitle: {
    color: 'var(--text-muted)',
    marginBottom: '20px'
  },
  differences: {
    margin: '20px 0',
    padding: '15px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  listItem: {
    padding: '8px 0',
    borderBottom: '1px solid var(--glass-border)'
  },
  field: {
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    display: 'block',
    marginBottom: '4px'
  },
  values: {
    display: 'flex',
    gap: '20px',
    fontSize: '0.85rem'
  },
  clientValue: {
    color: '#6366f1'
  },
  serverValue: {
    color: '#f59e0b'
  },
  noChanges: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem'
  },
  timestamps: {
    margin: '20px 0',
    padding: '15px',
    background: 'rgba(0,0,0,0.1)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    flexWrap: 'wrap'
  },
  actionBtn: {
    flex: 1,
    minWidth: '120px'
  }
};

export default ConflictModal;