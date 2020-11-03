import React from 'react';
import { BrowserRouter, Routes, Navigate } from 'react-router-dom';
import { Route, RoutePublic } from '@/app/router';
import { Error404 } from '@/errors';
import { LoginPage } from '@/app/auth/LoginPage';
import { LogoutPage } from '@/app/auth/LogoutPage';
import { AccountRoutes } from '@/app/account/Routes';
import { DashboardRoutes } from '@/app/dashboard/Routes';
import { Layout } from '@/app/layout/Layout';
import { RoutePublicOnly } from './router/RoutePublicOnly';

export const App = (props) => {
  return (
    <BrowserRouter {...props}>
      <Layout>
        <Routes>
          <RoutePublic path="/" element={<Navigate to="/dashboard" replace />} />

          <RoutePublicOnly path="/login" element={<LoginPage />} />
          <RoutePublic path="/account/*" element={<AccountRoutes />} />
          <Route path="/logout" element={<LogoutPage />} />

          <Route path="/dashboard/*" element={<DashboardRoutes />} />

          <RoutePublic path="*" element={<Error404 />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
