import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import './Dashboard.css';

function AdminDashboard() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.getCategories()
      .then(response => setCategories(response.data))
      .catch(error => console.error('Failed to fetch categories', error));
  }, []);

  const getLinkDestination = (categoryName) => {
      return `/category/${encodeURIComponent(categoryName)}`;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <br/>
      <div className="dashboard-grid">
        {categories.map((cat) => (
          <Link key={cat.name} to={getLinkDestination(cat.name)} className="dashboard-card" style={{ backgroundColor: cat.color }}>
            <h3>{cat.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
