import React from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import { Error404 } from '@/errors';
import { Route, RoutePublicOnly } from '@/app/router';
import { PageResetPasswordRequest } from '@/app/account/PageResetPasswordRequest';
import { PageResetPasswordConfirm } from '@/app/account/PageResetPasswordConfirm';
import { PageRegister } from '@/app/account/PageRegister';
import { PageActivate } from '@/app/account/PageActivate';
import { PageAccount } from '@/app/account/PageAccount';

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
