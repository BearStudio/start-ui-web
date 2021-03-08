import React from 'react';

import { Switch, useRouteMatch } from 'react-router-dom';

import { PageEntityCreate } from '@/app/entity/PageEntityCreate';
import { PageEntityList } from '@/app/entity/PageEntityList';
import { Route } from '@/app/router';
import { Error404 } from '@/errors';

const EntityRoutes = () => {
  let { url } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={url} render={() => <PageEntityList />} />
      <Route path={`${url}/create`} render={() => <PageEntityCreate />} />
      <Route path="*" render={() => <Error404 />} />
    </Switch>
  );
};

export default EntityRoutes;
