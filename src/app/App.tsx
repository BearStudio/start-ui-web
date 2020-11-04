import React from 'react';
import { BrowserRouter, Routes, Navigate } from 'react-router-dom';
import { Route, RoutePublic, RoutePublicOnly } from '@/app/router';
import { Error404 } from '@/errors';
import { PageLogin } from '@/app/auth/PageLogin';
import { PageLogout } from '@/app/auth/PageLogout';
import { AccountRoutes } from '@/app/account/Routes';
import { DashboardRoutes } from '@/app/dashboard/Routes';
import { Layout } from '@/app/layout/Layout';

export const App = (props) => {
  return (
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

          <RoutePublic path="*" element={<Error404 />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
