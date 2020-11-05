import React from 'react';
import { BrowserRouter, Routes, Navigate } from 'react-router-dom';
import { Route, RoutePublic, RoutePublicOnly } from '@/app/router';
import { Error404, ErrorBoundary } from '@/errors';
import { Layout } from '@/app/layout/Layout';
import { PageLogin } from '@/app/auth/PageLogin';
import { PageLogout } from '@/app/auth/PageLogout';
import { AccountRoutes } from '@/app/account/Routes';
import { DashboardRoutes } from '@/app/dashboard/Routes';
import { EntityRoutes } from '@/app/entity/Routes';

export const App = (props) => {
  return (
    <ErrorBoundary>
      <BrowserRouter {...props}>
        <Layout>
          <Routes>
            <RoutePublic
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            <RoutePublicOnly path="/login" element={<PageLogin />} />
            <RoutePublic path="/account/*" element={<AccountRoutes />} />
            <RoutePublic path="/logout" element={<PageLogout />} />

            <Route path="/dashboard/*" element={<DashboardRoutes />} />
            <Route path="/entity/*" element={<EntityRoutes />} />

            <RoutePublic path="*" element={<Error404 />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
