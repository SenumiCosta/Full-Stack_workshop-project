import React, { useState } from 'react';
import { Building2, X } from 'lucide-react';
import api from '../../api/apiClient';

const CreateOrgModal = ({ isOpen, onClose, onOrgCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter an organization name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/orgs', {
        name: name.trim(),
        description: description.trim()
      });
      const newOrg = res.data.data;
      if (onOrgCreated) {
        onOrgCreated(newOrg);
      }
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Failed to create organization:', err);
      setError(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div 
        className="glass-panel" 
        style={styles.modal} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.iconWrapper}>
              <Building2 size={20} color="#6366f1" />
            </div>
            <div>
              <h3 style={styles.title}>Create Organization</h3>
              <p style={styles.subtitle}>Collaborate with team members in a shared workspace</p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Organization Name *</label>
            <input
              type="text"
              placeholder="e.g. Acme Studio, DevTeam Alpha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
              autoFocus
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description (optional)</label>
            <textarea
              rows="3"
              placeholder="What does your organization work on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
            />
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={styles.cancelBtn}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
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
    background: 'rgba(0,0,0,0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    width: '100%',
    maxWidth: '480px',
    padding: '28px',
    borderRadius: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    margin: 0,
    fontSize: '1.3rem',
    color: 'var(--text-primary)'
  },
  subtitle: {
    margin: '3px 0 0 0',
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px'
  },
  errorBox: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '0.85rem',
    marginBottom: '16px'
  },
  inputGroup: {
    marginBottom: '18px'
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '0.9rem',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '0.9rem',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)',
    color: 'var(--text-primary)',
    outline: 'none',
    resize: 'vertical'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px'
  },
  cancelBtn: {
    padding: '8px 18px',
    borderRadius: '999px',
    fontSize: '0.9rem'
  },
  submitBtn: {
    padding: '8px 22px',
    borderRadius: '999px',
    fontSize: '0.9rem'
  }
};

export default CreateOrgModal;
