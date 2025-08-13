import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoginAsAdmin, setIsLoginAsAdmin] = useState(false);
  const { loginAction } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.login(email, password);
      const intendedRole = isLoginAsAdmin ? 'admin' : 'user';
      if (data.role !== intendedRole) {
        if (data.role === 'admin') {
          setError('Admin accounts must use the Admin portal to log in.');
        } else {
          setError('User accounts must use the User portal to log in.');
        }
        setLoading(false);
        return;
      }
      loginAction(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-info-panel">
        <img src="/logo.png" alt="Logo" className="login-info-logo" />
        <div className="login-info-text">
          <p>This system provides secure, efficient and streamlined inventory control to ensure<br />mission readiness. It enables accurate tracking, timely allocation and<br />effective management of essential resources across the unit.</p>
        </div>
      </div>
      <div className="login-box">
        <div className="login-header">
            <h2>{isLoginAsAdmin ? 'Admin Portal Login' : 'User Portal Login'}</h2>
            <p>BANSFC-10, MINUSCA</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="login-footer">
           <button className="toggle-login-mode" onClick={() => setIsLoginAsAdmin(!isLoginAsAdmin)}>
            {isLoginAsAdmin ? 'Switch to User Login' : 'Are you an Admin? Login here.'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
