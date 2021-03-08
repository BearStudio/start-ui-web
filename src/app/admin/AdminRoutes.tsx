import React from 'react';

import { Switch, Redirect, useRouteMatch } from 'react-router-dom';

import { PageApiDocumentation } from '@/app/admin/api/PageApiDocumentation';
import { Route } from '@/app/router';
import { Error404 } from '@/errors';

const AdminUsersRoutes = React.lazy(
  () => import('@/app/admin/users/AdminUsersRoutes')
);

const AdminRoutes = () => {
  const { url } = useRouteMatch();
  return (
    <Switch>
      <Route
        exact
        path={`${url}/`}
        render={() => <Redirect to={`${url}/users`} />}
      />
      <Route path={`${url}/users`} render={() => <AdminUsersRoutes />} />
      <Route path={`${url}/api`} render={() => <PageApiDocumentation />} />
      <Route path="*" render={() => <Error404 />} />
    </Switch>
  );
};

export default AdminRoutes;
