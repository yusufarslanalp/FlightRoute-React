import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import RoutesPage from './RoutesPage';
import Locations from './Locations';
import Transportations from './Transportations';
import Login from './Login';

const Layout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div>
      <h1 className="title">Welcome To Flight Route App</h1>

      <div style={{ display: 'flex' }}>
        <div style={{ width: '5%', padding: '10px' }}>

        </div>

        <div style={{ width: '10%', padding: '10px' }}>
          {!isLoginPage && <Navbar />}
        </div>

        <div style={{ width: '80%', padding: '10px' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/routes-page" element={<RoutesPage />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/transportations" element={<Transportations />} />
          </Routes>
        </div>

        <div style={{ width: '5%', padding: '10px' }}>

        </div>
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
