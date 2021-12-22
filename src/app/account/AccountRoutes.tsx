import React from 'react';

import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

import { PageActivate } from '@/app/account/PageActivate';
import { PagePassword } from '@/app/account/PagePassword';
import { PageProfile } from '@/app/account/PageProfile';
import { PageRegister } from '@/app/account/PageRegister';
import { PageResetPasswordConfirm } from '@/app/account/PageResetPasswordConfirm';
import { PageResetPasswordRequest } from '@/app/account/PageResetPasswordRequest';
import { Route as CustomRoute } from '@/app/router';
import { PublicOnlyRouteGuard } from '@/app/router/guards';
import { Error404 } from '@/errors';

const AccountRoutes = () => {
  const { url } = useRouteMatch();
  return (
    <Switch>
      <CustomRoute
        exact
        path={`${url}/`}
        render={() => <Redirect to={`${url}/profile`} />}
      />

      <Route
        exact
        path={`${url}/register`}
        render={() => (
          <PublicOnlyRouteGuard>
            <PageRegister />
          </PublicOnlyRouteGuard>
        )}
      />
      <Route
        exact
        path={`${url}/activate`}
        render={() => (
          <PublicOnlyRouteGuard>
            <PageActivate />
          </PublicOnlyRouteGuard>
        )}
      />
      <Route
        exact
        path={`${url}/reset`}
        render={() => (
          <PublicOnlyRouteGuard>
            <PageResetPasswordRequest />
          </PublicOnlyRouteGuard>
        )}
      />
      <Route
        exact
        path={`${url}/reset/finish`}
        render={() => (
          <PublicOnlyRouteGuard>
            <PageResetPasswordConfirm />
          </PublicOnlyRouteGuard>
        )}
      />

      <CustomRoute
        exact
        path={`${url}/profile`}
        render={() => <PageProfile />}
      />
      <CustomRoute
        exact
        path={`${url}/password`}
        render={() => <PagePassword />}
      />

      <CustomRoute path="*" render={() => <Error404 />} />
    </Switch>
  );
};

export default AccountRoutes;
