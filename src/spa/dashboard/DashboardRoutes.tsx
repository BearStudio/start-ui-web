import React from 'react';

import { Route, Routes } from 'react-router-dom';

import { ErrorPage } from '@/components/ErrorPage';
import { PageDashboard } from '@/spa/dashboard/PageDashboard';

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PageDashboard />} />
      <Route path="*" element={<ErrorPage errorCode={404} />} />
    </Routes>
  );
};

export default DashboardRoutes;
