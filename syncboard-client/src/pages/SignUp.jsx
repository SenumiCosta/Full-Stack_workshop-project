import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '..api/apiClient';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
  e.preventDefault();
  if (password !== confirmPassword) {
    setError('Passwords do not match.');
    return;
  }
  setError('');
  try {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('syncboard_token', res.data.token);
    localStorage.setItem('syncboard_user', JSON.stringify(res.data.user));
    navigate('/dashboard');
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed');
  }
};

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <h1 style={styles.logo}>SyncBoard</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Create your account</p>
        <form onSubmit={handleSignUp} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input type="email" placeholder="name@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={styles.button}>Sign Up</button>
        </form>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  card: { width: '100%', maxWidth: '400px', padding: '30px', textAlign: 'center' },
  logo: { fontSize: '2.2rem', color: 'var(--color-primary)', marginBottom: '5px' },
  form: { textAlign: 'left', margin: '20px 0' },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' },
  button: { width: '100%', padding: '10px' },
  error: { background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '0.85rem' }
};

export default SignUp;