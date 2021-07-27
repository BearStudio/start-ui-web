import React from 'react';

import { Switch, useRouteMatch } from 'react-router-dom';

import { PageUserCreate } from '@/app/admin/users/PageUserCreate';
import { PageUserUpdate } from '@/app/admin/users/PageUserUpdate';
import { PageUsers } from '@/app/admin/users/PageUsers';
import { Route } from '@/app/router';
import { Error404 } from '@/errors';

const AdminUsersRoutes = () => {
  const { url } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${url}/`} render={() => <PageUsers />} />
      <Route exact path={`${url}/create`} render={() => <PageUserCreate />} />
      <Route exact path={`${url}/:login`} render={() => <PageUserUpdate />} />
      <Route path="*" render={() => <Error404 />} />
    </Switch>
  );
};

export default AdminUsersRoutes;
