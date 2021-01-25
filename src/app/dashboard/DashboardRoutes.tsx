import React from 'react';

import { Switch, useRouteMatch } from 'react-router-dom';

import { PageDashboard } from '@/app/dashboard/PageDashboard';
import { Route } from '@/app/router';
import { Error404 } from '@/errors';

const DashboardRoutes = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={path} render={() => <PageDashboard />} />
      <Route path="*" render={() => <Error404 />} />
    </Switch>
  );
};

export default DashboardRoutes;
