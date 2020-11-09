import React from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import { Error404 } from '@/errors';
import { Route } from '@/app/router';
import { PageEntityList } from '@/app/entity/PageEntityList';
import { PageEntityCreate } from '@/app/entity/PageEntityCreate';

export const EntityRoutes = () => {
  let { path } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={path} render={() => <PageEntityList />} />
      <Route path={`${path}/create`} render={() => <PageEntityCreate />} />
      <Route path="*" render={() => <Error404 />} />
    </Switch>
  );
};
