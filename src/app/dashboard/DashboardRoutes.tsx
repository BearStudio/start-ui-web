import React from 'react';
import { Routes } from 'react-router-dom';
import { RouteAuth } from '@/app/router/RouteAuth';
import { RouteNotFound } from '@/app/router/RouteNotFound';
import { DashboardPage } from '@/app/dashboard/DashboardPage';

export const DashboardRoutes = () => {
  return (
    <Routes>
      <RouteNotFound path="*" />
      <RouteAuth path="/" element={<DashboardPage />} />
    </Routes>
  );
};
