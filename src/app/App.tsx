import React, { Suspense } from 'react';

import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter, Switch, Redirect } from 'react-router-dom';

import { PageLogin } from '@/app/auth/PageLogin';
import { PageLogout } from '@/app/auth/PageLogout';
import { Layout, Loader } from '@/app/layout';
import { Route, RouteAdmin, RoutePublic, RoutePublicOnly } from '@/app/router';
import { Error404, ErrorBoundary } from '@/errors';

const AdminRoutes = React.lazy(() => import('@/app/admin/AdminRoutes'));
const AccountRoutes = React.lazy(() => import('@/app/account/AccountRoutes'));
const DashboardRoutes = React.lazy(
  () => import('@/app/dashboard/DashboardRoutes')
);
const EntityRoutes = React.lazy(() => import('@/app/entity/EntityRoutes'));

export const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/app/">
        <Layout>
          <Suspense fallback={<Loader />}>
            <Switch>
              <RoutePublic
                exact
                path="/"
                render={() => <Redirect to="/dashboard" />}
              />

              <RoutePublicOnly
                exact
                path="/login"
                render={() => <PageLogin />}
              />
              <RoutePublic exact path="/logout" render={() => <PageLogout />} />

              <RoutePublic path="/account" render={() => <AccountRoutes />} />

              <Route path="/dashboard" render={() => <DashboardRoutes />} />
              <Route path="/entity" render={() => <EntityRoutes />} />

              <RouteAdmin path="/admin" render={() => <AdminRoutes />} />

              <RoutePublic path="*" render={() => <Error404 />} />
            </Switch>
          </Suspense>
        </Layout>
      </BrowserRouter>
      <ReactQueryDevtools />
    </ErrorBoundary>
  );
};
