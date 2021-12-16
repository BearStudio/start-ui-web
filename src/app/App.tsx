import React, { Suspense } from 'react';

import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';

import { PageLogin } from '@/app/auth/PageLogin';
import { PageLogout } from '@/app/auth/PageLogout';
import { Layout, Loader } from '@/app/layout';
import {
  Route as CustomRoute,
  RouteAdmin,
  RoutePublicOnly,
} from '@/app/router';
import { Error404, ErrorBoundary } from '@/errors';

const AdminRoutes = React.lazy(() => import('@/app/admin/AdminRoutes'));
const AccountRoutes = React.lazy(() => import('@/app/account/AccountRoutes'));
const DashboardRoutes = React.lazy(
  () => import('@/app/dashboard/DashboardRoutes')
);

export const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/app/">
        <Layout>
          <Suspense fallback={<Loader />}>
            <Switch>
              <Route
                exact
                path="/"
                render={() => <Redirect to="/dashboard" />}
              />

              <RoutePublicOnly
                exact
                path="/login"
                render={() => <PageLogin />}
              />
              <Route
                exact
                path="/logout"
                render={() => (
                  <ErrorBoundary>
                    <PageLogout />
                  </ErrorBoundary>
                )}
              />

              <Route
                path="/account"
                render={() => (
                  <ErrorBoundary>
                    <AccountRoutes />
                  </ErrorBoundary>
                )}
              />

              <CustomRoute
                path="/dashboard"
                render={() => <DashboardRoutes />}
              />

              <RouteAdmin path="/admin" render={() => <AdminRoutes />} />

              <Route path="*" render={() => <Error404 />} />
            </Switch>
          </Suspense>
        </Layout>
      </BrowserRouter>
      <ReactQueryDevtools />
    </ErrorBoundary>
  );
};
