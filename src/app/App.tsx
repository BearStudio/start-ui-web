import React from 'react';
import { BrowserRouter, Switch, Redirect } from 'react-router-dom';
import { Route } from '@/app/router';
import { Error404 } from '@/errors';
import { LoginPage } from '@/app/auth/LoginPage';
import { LogoutPage } from '@/app/auth/LogoutPage';
import { Routes as AccountRoutes } from '@/app/account/Routes';
import { Routes as DashboardRoutes } from '@/app/dashboard/Routes';
import { Layout } from '@/app/layout/Layout';

export const App = (props) => {
  return (
    <BrowserRouter {...props}>
      <Layout>
        <Switch>
          <Redirect exact from="/" to="/dashboard" />

          <Route path="/login" component={LoginPage} />
          <Route path="/logout" component={LogoutPage} />

          <Route path="/dashboard" component={DashboardRoutes} />
          <Route path="/account" component={AccountRoutes} />

          <Route component={Error404} />
        </Switch>
      </Layout>
    </BrowserRouter>
  );
};
