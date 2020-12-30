import React from 'react';

import { Switch, Redirect, useRouteMatch } from 'react-router-dom';

import { PageActivate } from '@/app/account/PageActivate';
import { PagePassword } from '@/app/account/PagePassword';
import { PageProfile } from '@/app/account/PageProfile';
import { PageRegister } from '@/app/account/PageRegister';
import { PageResetPasswordConfirm } from '@/app/account/PageResetPasswordConfirm';
import { PageResetPasswordRequest } from '@/app/account/PageResetPasswordRequest';
import { Route, RoutePublicOnly } from '@/app/router';
import { Error404 } from '@/errors';

const AccountRoutes = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route
        exact
        path={`${path}/`}
        render={() => <Redirect to={`${path}/profile`} />}
      />

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
        path={`${path}/reset/finish/:key?`}
        render={() => <PageResetPasswordConfirm />}
      />

      <Route exact path={`${path}/profile`} render={() => <PageProfile />} />
      <Route exact path={`${path}/password`} render={() => <PagePassword />} />

      <Route path="*" render={() => <Error404 />} />
    </Switch>
  );
};

export default AccountRoutes;
