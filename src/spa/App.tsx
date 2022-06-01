import React, { Suspense } from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { PageLogin } from '@/app/auth/PageLogin';
import { PageLogout } from '@/app/auth/PageLogout';
import { Layout, Loader } from '@/app/layout';
import { BrowserRouter } from '@/app/router/Router';
import {
  AdminRouteGuard,
  AuthenticatedRouteGuard,
  PublicOnlyRouteGuard,
} from '@/spa/router/guards';

const AdminRoutes = React.lazy(() => import('@/spa/admin/AdminRoutes'));
const AccountRoutes = React.lazy(() => import('@/spa/account/AccountRoutes'));
const DashboardRoutes = React.lazy(
  () => import('@/spa/dashboard/DashboardRoutes')
);

export const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/app">
        <Layout>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route
                path="login"
                element={
                  <PublicOnlyRouteGuard>
                    <PageLogin />
                  </PublicOnlyRouteGuard>
                }
              />
              <Route
                path="logout"
                element={
                  <ErrorBoundary>
                    <PageLogout />
                  </ErrorBoundary>
                }
              />

              <Route
                path="account/*"
                element={
                  <ErrorBoundary>
                    <AccountRoutes />
                  </ErrorBoundary>
                }
              />

              <Route
                path="dashboard/*"
                element={
                  <AuthenticatedRouteGuard>
                    <DashboardRoutes />
                  </AuthenticatedRouteGuard>
                }
              />

              <Route
                path="admin/*"
                element={
                  <AdminRouteGuard>
                    <AdminRoutes />
                  </AdminRouteGuard>
                }
              />

              <Route path="*" element={<ErrorPage errorCode={404} />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
      <ReactQueryDevtools />
    </ErrorBoundary>
  );
};
