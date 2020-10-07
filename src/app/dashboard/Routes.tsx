import React from 'react';
import { Switch } from 'react-router-dom';
import { Error404 } from '@/errors';
import { RouteAuth, Route } from '@/app/router';
import { DashboardPage } from '@/app/dashboard/DashboardPage';

export const Routes = ({ match }) => {
  return (
    <Switch>
      <RouteAuth exact path={`${match.url}/`} component={DashboardPage} />
      <Route component={Error404} />
    </Switch>
  );
};
