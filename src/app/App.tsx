import React from 'react';
import { BrowserRouter, Routes, Navigate } from 'react-router-dom';
import { Route, RouteAdmin, RoutePublic, RoutePublicOnly } from '@/app/router';
import { Error404, ErrorBoundary } from '@/errors';
import { Layout } from '@/app/layout/Layout';
import { PageLogin } from '@/app/auth/PageLogin';
import { PageLogout } from '@/app/auth/PageLogout';
import { AccountRoutes } from '@/app/account/Routes';
import { DashboardRoutes } from '@/app/dashboard/Routes';
import { EntityRoutes } from '@/app/entity/Routes';
import { AdminRoutes } from '@/app/admin/Routes';

import '@/app/config/axios';

export const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Routes>
            <RoutePublic
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            <RoutePublicOnly path="/login" element={<PageLogin />} />
            <RoutePublic path="/logout" element={<PageLogout />} />

            <RoutePublic path="/account/*" element={<AccountRoutes />} />

            <Route path="/dashboard/*" element={<DashboardRoutes />} />
            <Route path="/entity/*" element={<EntityRoutes />} />

            <RouteAdmin path="/admin/*" element={<AdminRoutes />} />

            <RoutePublic path="*" element={<Error404 />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
