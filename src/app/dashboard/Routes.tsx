import React from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import { Error404 } from '@/errors';
import { Route } from '@/app/router';
import { PageDashboard } from '@/app/dashboard/PageDashboard';

export const DashboardRoutes = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={path} render={() => <PageDashboard />} />
      <Route path="*" render={() => <Error404 />} />
    </Switch>
  );
};
