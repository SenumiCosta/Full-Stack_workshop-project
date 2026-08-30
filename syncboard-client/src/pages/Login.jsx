import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/apiClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Send login request to backend
      const response = await api.post('/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data);

      // Get JWT token from backend
      const token = response.data.token;

      // Get user details from backend
      const user = response.data.user;

      // Check if token exists
      if (!token) {
        setError('Login failed. No authentication token received.');
        return;
      }

      // Save JWT token
      localStorage.setItem('syncboard_token', token);

      // Save user information
      localStorage.setItem(
        'syncboard_user',
        JSON.stringify(user)
      );

      // Save authentication status
      localStorage.setItem('syncboard_auth', 'true');

      console.log('Token saved successfully');
      console.log('User:', user);

      // Navigate to dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Login failed:', error);

      setError(
        error.response?.data?.message ||
        'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>

        <h1 style={styles.logo}>
          SyncBoard
        </h1>

        <p
          style={{
            color: 'var(--text-muted)',
            marginBottom: '30px'
          }}
        >
          Sign in to collaborate
        </p>

        <form onSubmit={handleLogin} style={styles.form}>

          {/* Error Message */}
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Email Address
            </label>

            <input
              type="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn-primary"
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)'
          }}
        >
          Don't have an account?{' '}

          <Link
            to="/signup"
            style={{
              color: 'var(--color-primary)'
            }}
          >
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh'
  },

  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px 30px',
    textAlign: 'center'
  },

  logo: {
    fontSize: '2.2rem',
    marginBottom: '5px',
    color: 'var(--color-primary)'
  },

  form: {
    textAlign: 'left',
    margin: '20px 0'
  },

  inputGroup: {
    marginBottom: '20px'
  },

  label: {
    display: 'block',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '5px'
  },

  button: {
    width: '100%',
    padding: '12px'
  },

  error: {
    background: 'rgba(239,68,68,0.1)',
    color: '#fca5a5',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '0.85rem'
  }
};

export default Login;