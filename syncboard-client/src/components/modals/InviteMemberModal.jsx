import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Send, Copy, ExternalLink, X, Loader2 } from 'lucide-react';
import api from '../../api/apiClient';

const InviteMemberModal = ({ isOpen, onClose, organization }) => {
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [verification, setVerification] = useState(null); // null | { exists: true, user } | { exists: false, message }
  const [isSending, setIsSending] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const isValidEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  useEffect(() => {
    const trimmed = email.trim();
    if (!trimmed || !isValidEmail(trimmed)) {
      setVerification(null);
      setIsChecking(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const res = await api.get(`/orgs/check-user?email=${encodeURIComponent(trimmed.toLowerCase())}`);
        setVerification(res.data);
      } catch (err) {
        setVerification({ exists: false, message: 'Could not verify user' });
      } finally {
        setIsChecking(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [email]);

  if (!isOpen || !organization) return null;

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!verification || !verification.exists) return;

    setIsSending(true);
    try {
      const res = await api.post(`/orgs/${organization._id}/invite`, {
        email: email.trim().toLowerCase()
      });
      setInviteResult(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetModal = () => {
    setEmail('');
    setVerification(null);
    setInviteResult(null);
    setCopied(false);
    onClose();
  };

  return (
    <div style={styles.backdrop} onClick={resetModal}>
      <div 
        className="glass-panel" 
        style={styles.modal} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.iconWrapper}>
              <Mail size={20} color="#6366f1" />
            </div>
            <div>
              <h3 style={styles.title}>Invite Team Member</h3>
              <p style={styles.subtitle}>Invite an existing SyncBoard user to <strong>{organization.name}</strong></p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={resetModal} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {inviteResult ? (
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>
              <CheckCircle size={36} color="#10b981" />
            </div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.15rem' }}>Invitation Sent!</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 18px 0' }}>
              An invitation email was sent to <strong>{email}</strong>. They can click the link in their email to join.
            </p>

            <div style={styles.linkBox}>
              <input
                type="text"
                readOnly
                value={inviteResult.inviteLink}
                style={styles.linkInput}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleCopy(inviteResult.inviteLink)}
                style={styles.copyBtn}
              >
                <Copy size={14} /> {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            {inviteResult.previewUrl && (
              <a
                href={inviteResult.previewUrl}
                target="_blank"
                rel="noreferrer"
                style={styles.previewLink}
              >
                <ExternalLink size={14} /> View Email in Test Inbox (Ethereal)
              </a>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={resetModal}
              style={{ width: '100%', marginTop: '20px', borderRadius: '999px', padding: '10px' }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendInvite}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Member Email Address</label>
              <div style={styles.inputWrapper}>
                <input
                  type="email"
                  placeholder="Enter their registered SyncBoard email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                  autoFocus
                />
                {isChecking && (
                  <div style={styles.inputSpinner}>
                    <Loader2 size={16} className="spin" color="var(--color-primary)" />
                  </div>
                )}
              </div>
            </div>

            {/* Verification Status Feedback */}
            {verification && (
              <div style={verification.exists ? styles.verifiedBox : styles.unverifiedBox}>
                {verification.exists ? (
                  <>
                    <CheckCircle size={16} color="#10b981" />
                    <div>
                      <strong style={{ color: '#34d399' }}>SyncBoard User Found</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#a7f3d0' }}>
                        {verification.user.name} ({verification.user.email})
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} color="#f87171" />
                    <div>
                      <strong style={{ color: '#f87171' }}>User Not Found</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#fca5a5' }}>
                        {verification.message || 'This user must sign up on SyncBoard first.'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            <div style={styles.actions}>
              <button
                type="button"
                className="btn-secondary"
                onClick={resetModal}
                style={styles.cancelBtn}
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={styles.submitBtn}
                disabled={!verification || !verification.exists || isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 size={15} className="spin" /> Sending Email...
                  </>
                ) : (
                  <>
                    <Send size={15} /> Send Invitation
                  </>
                )}
              </button>
            </div>
          </form>
        )}
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
    maxWidth: '500px',
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
  inputGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '6px'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    width: '100%',
    padding: '10px 40px 10px 14px',
    fontSize: '0.9rem',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)',
    color: 'var(--text-primary)',
    outline: 'none'
  },
  inputSpinner: {
    position: 'absolute',
    right: '12px'
  },
  verifiedBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '10px',
    padding: '12px 14px',
    marginBottom: '18px',
    fontSize: '0.85rem'
  },
  unverifiedBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    padding: '12px 14px',
    marginBottom: '18px',
    fontSize: '0.85rem'
  },
  successContainer: {
    textAlign: 'center',
    padding: '10px 0'
  },
  successIcon: {
    marginBottom: '12px'
  },
  linkBox: {
    display: 'flex',
    gap: '8px',
    marginBottom: '14px'
  },
  linkInput: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '0.8rem',
    borderRadius: '6px',
    border: '1px solid var(--glass-border)',
    background: 'rgba(0,0,0,0.2)',
    color: 'var(--text-primary)'
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    fontSize: '0.8rem',
    borderRadius: '6px'
  },
  previewLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#818cf8',
    fontSize: '0.85rem',
    textDecoration: 'none',
    marginTop: '6px'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '20px'
  },
  cancelBtn: {
    padding: '8px 18px',
    borderRadius: '999px',
    fontSize: '0.9rem'
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 22px',
    borderRadius: '999px',
    fontSize: '0.9rem'
  }
};

export default InviteMemberModal;
