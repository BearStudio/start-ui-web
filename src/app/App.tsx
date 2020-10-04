import React from 'react';
import { BrowserRouter, Navigate, Routes } from 'react-router-dom';
import { Route, RouteNotFound } from '@/app/router';
import { LoginPage } from '@/app/auth/LoginPage';
import { LogoutPage } from '@/app/auth/LogoutPage';
import { AccountRoutes } from '@/app/account/AccountRoutes';
import { DashboardRoutes } from '@/app/dashboard/DashboardRoutes';
import { Layout } from '@/app/layout/Layout';

export const App = (props) => {
  return (
    <BrowserRouter {...props}>
      <Layout>
        <Routes>
          <RouteNotFound path="*" />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />

          <Route path="/account/*" element={<AccountRoutes />} />
          <Route path="/dashboard/*" element={<DashboardRoutes />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
