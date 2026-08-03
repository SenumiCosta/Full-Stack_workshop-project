import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    // Simulate successful login
    localStorage.setItem('syncboard_auth', 'true');
    localStorage.setItem('syncboard_user', email.split('@')[0]);
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <h1 style={styles.logo}>SyncBoard</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Sign in to collaborate</p>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={styles.button}>
            Sign In
          </button>
        </form>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--color-primary)' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  card: { width: '100%', maxWidth: '400px', padding: '40px 30px', textAlign: 'center' },
  logo: { fontSize: '2.2rem', marginBottom: '5px', color: 'var(--color-primary)' },
  form: { textAlign: 'left', margin: '20px 0' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' },
  button: { width: '100%', padding: '12px' },
  error: { background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.85rem' }
};

export default Login;
