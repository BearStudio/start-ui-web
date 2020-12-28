import React from 'react';

import { Switch, useRouteMatch } from 'react-router-dom';

import { AdminUsersRoutes } from '@/app/admin/users/Routes';
import { Route } from '@/app/router';
import { Error404 } from '@/errors';

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
