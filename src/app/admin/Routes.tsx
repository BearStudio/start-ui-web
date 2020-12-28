import React from 'react';

import { Switch, useRouteMatch } from 'react-router-dom';

import { Route } from '@/app/router';
import { Error404 } from '@/errors';

const AdminUsersRoutes = React.lazy(() => import('@/app/admin/users/Routes'));

const AdminRoutes = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/users`} render={() => <AdminUsersRoutes />} />
      <Route path="*" render={() => <Error404 />} />
    </Switch>
  );
};

export default AdminRoutes;
