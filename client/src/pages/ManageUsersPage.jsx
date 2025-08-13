import React, { useState } from 'react';
import * as api from '../services/api';
import './ManageUsersPage.css';

function ManageUsersPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.createUser({ email, password, role });
      setSuccess(`Successfully created ${role}: ${email}`);
      setEmail('');
      setPassword('');
      setRole('user');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create user.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-users-container">
      <h1>Manage Users</h1>
      <p>Admins can create new user accounts here.</p>
      <div className="user-creation-form">
        <h2>Create New User</h2>
        <form onSubmit={handleSubmit}>
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
          <div className="input-group">
            <label htmlFor="role">Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ManageUsersPage;
