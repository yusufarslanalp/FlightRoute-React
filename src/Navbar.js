import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        <li style={{ margin: '10px 0' }}>
          <Link to="/routes-page">Routes</Link>
        </li>
        <li style={{ margin: '10px 0' }}>
          <Link to="/locations">Locations</Link>
        </li>
        <li style={{ margin: '10px 0' }}>
          <Link to="/transportations">Transportations</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
