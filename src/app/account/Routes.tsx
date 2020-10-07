import React from 'react';
import { Switch } from 'react-router-dom';
import { Error404 } from '@/errors';
import { Route } from '@/app/router';
import { ResetPasswordRequestPage } from '@/app/account/ResetPasswordRequestPage';
import { ResetPasswordConfirmPage } from '@/app/account/ResetPasswordConfirmPage';

export const Routes = ({ match }) => {
  return (
    <Switch>
      <Route
        exact
        path={`${match.url}/reset`}
        component={ResetPasswordRequestPage}
      />
      <Route
        exact
        path={`${match.url}/reset/confirm/:resetKey`}
        component={ResetPasswordConfirmPage}
      />

      <Route component={Error404} />
    </Switch>
  );
};
