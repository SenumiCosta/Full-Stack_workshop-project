import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building2, CheckCircle, AlertCircle, ArrowRight, LogIn, Loader2 } from 'lucide-react';
import api from '../api/apiClient';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [inviteData, setInviteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinedSuccess, setJoinedSuccess] = useState(false);

  const currentToken = localStorage.getItem('syncboard_token');
  const storedUser = localStorage.getItem('syncboard_user')
    ? JSON.parse(localStorage.getItem('syncboard_user'))
    : null;

  useEffect(() => {
    const fetchInviteDetails = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await api.get(`/orgs/invitation/${token}`);
        setInviteData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invitation link');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchInviteDetails();
    }
  }, [token]);

  const handleAccept = async () => {
    setIsJoining(true);
    setError('');

    try {
      await api.post(`/orgs/invitation/${token}/accept`);
      setJoinedSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLoginRedirect = () => {
    localStorage.setItem('syncboard_pending_invite', token);
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.logoBadge}>
          <Building2 size={28} color="#6366f1" />
        </div>

        {isLoading ? (
          <div style={styles.centerBox}>
            <Loader2 size={32} className="spin" color="var(--color-primary)" />
            <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading invitation details...</p>
          </div>
        ) : error ? (
          <div style={styles.centerBox}>
            <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Invitation Error</h3>
            <p style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '24px' }}>{error}</p>
            <Link to="/dashboard" className="btn-primary" style={styles.btnLink}>
              Go to Dashboard
            </Link>
          </div>
        ) : joinedSuccess ? (
          <div style={styles.centerBox}>
            <CheckCircle size={44} color="#10b981" style={{ marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Welcome to the Team!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              You are now an official member of <strong>{inviteData?.organization?.name}</strong>.
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate('/dashboard')}
              style={styles.actionBtn}
            >
              Go to Dashboard <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div>
            <h2 style={styles.heading}>You're Invited!</h2>
            <p style={styles.subheading}>
              <strong>{inviteData?.inviter?.name || 'A team lead'}</strong> has invited you to join:
            </p>

            <div style={styles.orgCard}>
              <div style={styles.orgAvatar}>
                {inviteData?.organization?.name?.[0]?.toUpperCase() || 'O'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={styles.orgName}>{inviteData?.organization?.name}</h3>
                {inviteData?.organization?.description && (
                  <p style={styles.orgDesc}>{inviteData.organization.description}</p>
                )}
              </div>
            </div>

            <p style={styles.sentToText}>
              Invitation for: <strong>{inviteData?.email}</strong>
            </p>

            {currentToken ? (
              <div>
                {storedUser && storedUser.email?.toLowerCase() !== inviteData?.email?.toLowerCase() && (
                  <div style={styles.warningBox}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#f59e0b' }}>
                      You are currently logged in as <strong>{storedUser.email}</strong>. This invitation was sent to <strong>{inviteData?.email}</strong>.
                    </p>
                  </div>
                )}
                <button
                  className="btn-primary"
                  onClick={handleAccept}
                  disabled={isJoining}
                  style={styles.actionBtn}
                >
                  {isJoining ? (
                    <>
                      <Loader2 size={16} className="spin" /> Joining...
                    </>
                  ) : (
                    <>
                      Accept Invitation & Join <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Please log in to your SyncBoard account to accept this invitation.
                </p>
                <button
                  className="btn-primary"
                  onClick={handleLoginRedirect}
                  style={styles.actionBtn}
                >
                  <LogIn size={16} /> Log In to Accept
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'var(--bg-primary)'
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '36px 28px',
    textAlign: 'center',
    borderRadius: '24px'
  },
  logoBadge: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto'
  },
  centerBox: {
    padding: '20px 0'
  },
  heading: {
    margin: '0 0 8px 0',
    fontSize: '1.6rem',
    color: 'var(--text-primary)'
  },
  subheading: {
    margin: '0 0 24px 0',
    fontSize: '0.9rem',
    color: 'var(--text-muted)'
  },
  orgCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--glass-border)',
    borderRadius: '14px',
    padding: '16px 20px',
    marginBottom: '20px'
  },
  orgAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  orgName: {
    margin: 0,
    fontSize: '1.15rem',
    color: 'var(--text-primary)'
  },
  orgDesc: {
    margin: '4px 0 0 0',
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  sentToText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '24px'
  },
  warningBox: {
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '18px'
  },
  actionBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '999px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '0.95rem'
  },
  btnLink: {
    display: 'inline-block',
    padding: '10px 24px',
    borderRadius: '999px',
    textDecoration: 'none',
    fontSize: '0.9rem'
  }
};

export default AcceptInvite;
