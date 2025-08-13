import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

function Sidebar() {
  const { user, logoutAction } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.png" alt="Logo" className="sidebar-logo" />
        <div className="sidebar-header-text">
          <h3>BANSFC-10 IMS</h3>
          <p>MINUSCA</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li><NavLink to="/" end>Dashboard</NavLink></li>
          {user?.role === 'admin' && (
            <li><NavLink to="/admin/users">Manage Users</NavLink></li>
          )}
        </ul>
      </nav>
      <div className="sidebar-footer" onClick={logoutAction}>
        <p>Logout</p>
      </div>
    </aside>
  );
}

export default Sidebar;
