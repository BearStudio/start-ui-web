import React from 'react';
import { Link } from 'react-router-dom';

export const PageDashboard = () => {
  return (
    <>
      PageDashboard Component
      <br />
      <Link to="/logout">Go to Logout</Link>
    </>
  );
};
