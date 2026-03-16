import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import RoutesPage from './RoutesPage';
import Locations from './Locations';
import Transportations from './Transportations';

const App = () => {
  return (
    <Router>
      <div>
      <h1 className="title">Welcome To SkyRoute App</h1>
        
        <div style={{ display: 'flex' }}>
          <div style={{ width: '5%', padding: '10px' }}>

          </div>

          <div style={{ width: '10%', padding: '10px' }}>
            <Navbar />
          </div>
          
          <div style={{ width: '80%', padding: '10px' }}>
            <Routes>
              <Route path="/routes-page" element={<RoutesPage />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/transportations" element={<Transportations />} />
            </Routes>
          </div>

          <div style={{ width: '5%', padding: '10px' }}>

          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
