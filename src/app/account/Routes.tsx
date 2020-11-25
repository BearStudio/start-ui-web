import React from 'react';

import { Switch, useRouteMatch } from 'react-router-dom';

import { PageAccount } from '@/app/account/PageAccount';
import { PageActivate } from '@/app/account/PageActivate';
import { PageRegister } from '@/app/account/PageRegister';
import { PageResetPasswordConfirm } from '@/app/account/PageResetPasswordConfirm';
import { PageResetPasswordRequest } from '@/app/account/PageResetPasswordRequest';
import { Route, RoutePublicOnly } from '@/app/router';
import { Error404 } from '@/errors';

export const AccountRoutes = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <RoutePublicOnly
        exact
        path={`${path}/register`}
        render={() => <PageRegister />}
      />
      <RoutePublicOnly
        exact
        path={`${path}/activate`}
        render={() => <PageActivate />}
      />
      <RoutePublicOnly
        exact
        path={`${path}/reset`}
        render={() => <PageResetPasswordRequest />}
      />
      <RoutePublicOnly
        exact
        path={`${path}/reset/confirm/:resetKey`}
        render={() => <PageResetPasswordConfirm />}
      />

      <Route exact path={path} render={() => <PageAccount />} />

      <Route path="*" render={() => <Error404 />} />
    </Switch>
  );
};
