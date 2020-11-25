import React from 'react';

import { ReactQueryDevtools } from 'react-query-devtools';
import { BrowserRouter, Switch, Redirect } from 'react-router-dom';

import { AccountRoutes } from '@/app/account/Routes';
import { AdminRoutes } from '@/app/admin/Routes';
import { PageLogin } from '@/app/auth/PageLogin';
import { PageLogout } from '@/app/auth/PageLogout';
import { DashboardRoutes } from '@/app/dashboard/Routes';
import { EntityRoutes } from '@/app/entity/Routes';
import { Layout } from '@/app/layout/Layout';
import { Route, RouteAdmin, RoutePublic, RoutePublicOnly } from '@/app/router';
import { Error404, ErrorBoundary } from '@/errors';

export const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/">
        <Layout>
          <Switch>
            <RoutePublic
              exact
              path="/"
              render={() => <Redirect to="/dashboard" />}
            />

            <RoutePublicOnly exact path="/login" render={() => <PageLogin />} />
            <RoutePublic exact path="/logout" render={() => <PageLogout />} />

            <RoutePublic path="/account" render={() => <AccountRoutes />} />

            <Route path="/dashboard" render={() => <DashboardRoutes />} />
            <Route path="/entity" render={() => <EntityRoutes />} />

            <RouteAdmin path="/admin" render={() => <AdminRoutes />} />

            <RoutePublic path="*" render={() => <Error404 />} />
          </Switch>
        </Layout>
      </BrowserRouter>
      <ReactQueryDevtools />
    </ErrorBoundary>
  );
};
