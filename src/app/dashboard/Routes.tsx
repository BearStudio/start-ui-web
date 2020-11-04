import React from 'react';
import { Routes } from 'react-router-dom';
import { Error404 } from '@/errors';
import { Route } from '@/app/router';
import { PageDashboard } from '@/app/dashboard/PageDashboard';

export const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PageDashboard />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
