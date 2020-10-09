import React from 'react';
import { BrowserRouter, Routes, Navigate } from 'react-router-dom';
import { Route } from '@/app/router';
import { Error404 } from '@/errors';
import { LoginPage } from '@/app/auth/LoginPage';
import { LogoutPage } from '@/app/auth/LogoutPage';
import { AccountRoutes } from '@/app/account/Routes';
import { DashboardRoutes } from '@/app/dashboard/Routes';
import { Layout } from '@/app/layout/Layout';

export const App = (props) => {
  return (
    <BrowserRouter {...props}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />

          <Route path="/dashboard/*" element={<DashboardRoutes />} />
          <Route path="/account/*" element={<AccountRoutes />} />

          <Route path="*" element={<Error404 />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
