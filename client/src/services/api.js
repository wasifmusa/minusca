import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((req) => {
  const user = localStorage.getItem('user');
  if (user) {
    req.headers.Authorization = `Bearer ${JSON.parse(user).token}`;
  }
  return req;
});

export const login = (email, password) => API.post('/auth/login', { email, password });

export const getCategories = () => API.get('/inventory/categories');
export const getItemsByCategory = (categoryName) => API.get(`/inventory/${categoryName}`);
export const createItem = (itemData) => API.post('/inventory', itemData);
export const updateItem = (id, itemData) => API.put(`/inventory/${id}`, itemData);
export const deleteItem = (id) => API.delete(`/inventory/${id}`);
export const createUser = (userData) => API.post('/auth/users', userData);

export const exportCategory = (categoryName) => API.get(`/inventory/export/${categoryName}`, { responseType: 'blob' });
