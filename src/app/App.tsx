import React from 'react';
import { BrowserRouter, Switch, Redirect } from 'react-router-dom';
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
    </ErrorBoundary>
  );
};
