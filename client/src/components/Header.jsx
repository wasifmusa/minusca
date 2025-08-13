import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <h2>Inventory Management System</h2>
      </div>
      <div className="header-right">
        {user && (
          <div className="user-profile">
            <span>{user.email} ({user.role})</span>
            <div className="user-avatar">
              {user.email.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
