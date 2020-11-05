import React from 'react';
import { BrowserRouter, Routes, Navigate } from 'react-router-dom';
import { Route, RoutePublic, RoutePublicOnly } from '@/app/router';
import { Error404, ErrorBoundary } from '@/errors';
import { PageLogin } from '@/app/auth/PageLogin';
import { PageLogout } from '@/app/auth/PageLogout';
import { AccountRoutes } from '@/app/account/Routes';
import { DashboardRoutes } from '@/app/dashboard/Routes';

export const App = (props) => {
  return (
    <ErrorBoundary>
      <BrowserRouter {...props}>
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
      </BrowserRouter>
    </ErrorBoundary>
  );
};
