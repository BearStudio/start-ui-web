import React from 'react';

import { Switch, Redirect, useRouteMatch } from 'react-router-dom';

import { PageApiDocumentation } from '@/app/admin/api/PageApiDocumentation';
import { Route } from '@/app/router';
import { Error404 } from '@/errors';

const AdminUsersRoutes = React.lazy(
  () => import('@/app/admin/users/AdminUsersRoutes')
);

const AdminRoutes = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route
        exact
        path={`${path}/`}
        render={() => <Redirect to={`${path}/users`} />}
      />
      <Route path={`${path}/users`} render={() => <AdminUsersRoutes />} />
      <Route path={`${path}/api`} render={() => <PageApiDocumentation />} />
      <Route path="*" render={() => <Error404 />} />
    </Switch>
  );
};

export default AdminRoutes;
