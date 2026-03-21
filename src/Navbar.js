import React from 'react';
import { Link } from 'react-router-dom';

const PAGE_NAV_CONFIG = [
  { pageName: 'ROUTES', label: 'Routes', to: '/routes-page' },
  { pageName: 'LOCATIONS', label: 'Locations', to: '/locations' },
  { pageName: 'TRANSPORTATIONS', label: 'Transportations', to: '/transportations' },
];

const Navbar = ({ allowedPages }) => {
  return (
    <nav>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {PAGE_NAV_CONFIG.filter(item => allowedPages.includes(item.pageName)).map(item => (
          <li key={item.pageName} style={{ margin: '10px 0' }}>
            <Link to={item.to}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;