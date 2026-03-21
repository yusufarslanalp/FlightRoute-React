import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import RoutesPage from './RoutesPage';
import Locations from './Locations';
import Transportations from './Transportations';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import apiClient, { setAuthToken } from './apiClient';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';
  const [allowedPages, setAllowedPages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) return;

    apiClient.get('/allowed-page-names')
      .then(res => setAllowedPages(res.data))
      .catch(() => setAllowedPages([]));
  }, [isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setAuthToken(null);
    setAllowedPages([]);
    navigate('/login');
  };

  return (
    <div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 20px' }}>
        <h1 className="title" style={{ margin: 0, textAlign: 'center' }}>Welcome To Flight Route App</h1>
        {!isLoginPage && (
          <button
            onClick={handleLogout}
            style={{
              position: 'absolute',
              right: '20px',
              padding: '8px 16px',
              backgroundColor: '#e53935',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        )}
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: '5%', padding: '10px' }} />

        <div style={{ width: '10%', padding: '10px' }}>
          {!isLoginPage && <Navbar allowedPages={allowedPages} />}
        </div>

        <div style={{ width: '80%', padding: '10px' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/routes-page" element={<ProtectedRoute><RoutesPage /></ProtectedRoute>} />
            <Route path="/locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />
            <Route path="/transportations" element={<ProtectedRoute><Transportations /></ProtectedRoute>} />
          </Routes>
        </div>

        <div style={{ width: '5%', padding: '10px' }} />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout />
    </Router>
  );
};

export default App;